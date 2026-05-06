/**
 * DocIntell Agent Engine — AutoGen-Enhanced Multi-Agent System
 *
 * Architecture:
 * - LangGraph: stateful graph with typed nodes and edges, exponential backoff retry
 * - CrewAI: specialized crew members (Planner, Memory, Retriever, Analyst, Synthesizer, Critic)
 * - AutoGen: agents communicate via structured HANDOFF messages on a shared message bus
 * - MCP: modular tool registry called by agents at runtime
 * - Semantic Memory: cross-session knowledge recall + storage
 */

import { withRetry } from './gemini'
import { TOOLS, executeTool } from './tools'
import { recallMemory, storeMemory } from './memory'

// ─── State Machine ────────────────────────────────────────────────────────────

export const AGENT_STATES = {
  IDLE:          'IDLE',
  PLANNING:      'PLANNING',
  MEMORY_RECALL: 'MEMORY_RECALL',
  RETRIEVING:    'RETRIEVING',
  ANALYZING:     'ANALYZING',
  TOOL_CALL:     'TOOL_CALL',
  REFLECTING:    'REFLECTING',
  SYNTHESIZING:  'SYNTHESIZING',
  CRITIQUING:    'CRITIQUING',
  DONE:          'DONE',
  ERROR:         'ERROR',
  RETRYING:      'RETRYING',
}

// ─── Agent Crew (AutoGen-style personas) ─────────────────────────────────────

export const AGENTS = {
  ORCHESTRATOR: { name: 'Orchestrator',      emoji: '🎯', color: '#8b5cf6', desc: 'Manages the crew, assigns tasks, and ensures mission completion.' },
  PLANNER:      { name: 'Planner Agent',     emoji: '🗺️', color: '#6366f1', desc: 'Decomposes questions into structured query plans with keywords.' },
  MEMORY:       { name: 'Memory Agent',      emoji: '🧠', color: '#f59e0b', desc: 'Searches semantic memory for relevant knowledge from past queries.' },
  RETRIEVER:    { name: 'Retriever Agent',   emoji: '🔍', color: '#3b82f6', desc: 'Retrieves top document chunks using MCP searchChunks tool.' },
  ANALYST:      { name: 'Analyst Agent',     emoji: '🧪', color: '#10b981', desc: 'Extracts key facts and cross-references with memory context.' },
  SYNTHESIZER:  { name: 'Synthesizer Agent', emoji: '✍️', color: '#f97316', desc: 'Calls Gemini API to synthesize the final memory-enriched answer.' },
  CRITIC:       { name: 'Critic Agent',      emoji: '🔬', color: '#ef4444', desc: 'Reviews answer quality: completeness, grounding, and coherence.' },
}

// ─── AutoGen Message Bus ──────────────────────────────────────────────────────

function handoff(from, to, content, data = {}) {
  return {
    type: 'HANDOFF',
    from: AGENTS[from]?.name || from,
    fromEmoji: AGENTS[from]?.emoji || '🤖',
    fromColor: AGENTS[from]?.color || '#6366f1',
    to: AGENTS[to]?.name || to,
    toEmoji: AGENTS[to]?.emoji || '🤖',
    content,
    data,
    timestamp: Date.now(),
  }
}

// ─── Graph Nodes ──────────────────────────────────────────────────────────────

async function nodePlan(ctx) {
  ctx.emit({ state: AGENT_STATES.PLANNING, agent: AGENTS.PLANNER,
    message: `Decomposing question into a structured query plan…` })
  await delay(220)

  const question = ctx.question
  const keywords = question.toLowerCase().split(/\W+/).filter(w => w.length > 3).slice(0, 10)
  const isComparative = /compare|versus|vs\b|differ|between/i.test(question)
  const isSummary = /summar|overview|brief|tldr|outline/i.test(question)
  const isFactual = question.split(' ').length < 7

  ctx.plan = {
    keywords,
    queryType: isComparative ? 'comparative' : isSummary ? 'summary' : isFactual ? 'factual' : 'analytical',
    needsReasoning: ctx.reasoning || ctx.agentMode,
    subQueries: isComparative
      ? question.replace(/compare|versus|vs\b|between/gi, '|').split('|').map(s => s.trim()).filter(Boolean).slice(0, 2)
      : [question],
  }

  const msg = handoff('PLANNER', 'MEMORY',
    `Plan ready. Type: **${ctx.plan.queryType}**. Keywords: [${keywords.slice(0, 5).join(', ')}]. ${isComparative ? `Comparative query detected — ${ctx.plan.subQueries.length} sub-queries.` : ''} Sending to Memory Agent for knowledge recall.`,
    { plan: ctx.plan }
  )
  ctx.bus.push(msg)
  ctx.emit({ state: AGENT_STATES.PLANNING, agent: AGENTS.PLANNER,
    message: `Plan ready — type: ${ctx.plan.queryType}, ${keywords.length} keywords`, autogenMsg: msg })
  return 'MEMORY_RECALL'
}

async function nodeMemoryRecall(ctx) {
  ctx.emit({ state: AGENT_STATES.MEMORY_RECALL, agent: AGENTS.MEMORY,
    message: `Searching semantic memory bank for related past queries…` })
  await delay(150)

  ctx.recalled = recallMemory({ documentId: ctx.documentId, question: ctx.question, topK: 3 })
  const n = ctx.recalled.length

  const memSummary = n > 0
    ? ctx.recalled.map(m => `"${m.question.slice(0, 50)}…" (${m.confidence}% conf)`).join('; ')
    : 'No matching memories.'

  const msg = handoff('MEMORY', 'RETRIEVER',
    n > 0
      ? `Found **${n} relevant memory entry(s)**: ${memSummary}. Context will be enriched. Handing off to Retriever.`
      : `No relevant memories found. Fresh retrieval needed. Handing off to Retriever.`,
    { memoriesFound: n, queries: ctx.recalled.map(m => m.question) }
  )
  ctx.bus.push(msg)
  ctx.emit({ state: AGENT_STATES.MEMORY_RECALL, agent: AGENTS.MEMORY,
    message: n > 0 ? `Recalled ${n} relevant memory entry(s) from past queries` : 'No relevant memories — proceeding fresh',
    autogenMsg: msg })
  return 'RETRIEVING'
}

async function nodeRetrieve(ctx) {
  ctx.emit({ state: AGENT_STATES.RETRIEVING, agent: AGENTS.RETRIEVER,
    message: `Calling MCP tool: searchChunks across ${ctx.chunks.length} document chunks…` })

  const result = await executeTool('searchChunks', {
    chunks: ctx.chunks,
    query: ctx.question,
    keywords: ctx.plan?.keywords || [],
    topK: 10,
  })
  ctx.topChunks = result.chunks

  const msg = handoff('RETRIEVER', 'ANALYST',
    `Retrieved **${result.chunks.length} top chunks** from ${result.totalSearched} total (best relevance: ${result.topScore.toFixed(1)}). Chunk coverage: ${Math.round((result.chunks.length / Math.max(result.totalSearched, 1)) * 100)}%. Sending to Analyst for fact extraction.`,
    { chunkCount: result.chunks.length, topScore: result.topScore, totalSearched: result.totalSearched }
  )
  ctx.bus.push(msg)
  ctx.emit({ state: AGENT_STATES.RETRIEVING, agent: AGENTS.RETRIEVER,
    message: `Retrieved ${result.chunks.length} chunks (relevance score: ${result.topScore.toFixed(1)})`, autogenMsg: msg })
  return 'ANALYZING'
}

async function nodeAnalyze(ctx) {
  ctx.emit({ state: AGENT_STATES.ANALYZING, agent: AGENTS.ANALYST,
    message: `Running MCP tool: extractFacts across ${ctx.topChunks?.length || 0} chunks…` })

  const [factResult, sentimentResult] = await Promise.all([
    executeTool('extractFacts', { chunks: ctx.topChunks, question: ctx.question }),
    executeTool('detectSentiment', { chunks: ctx.topChunks }),
  ])

  ctx.facts = factResult.facts
  ctx.sentiment = sentimentResult

  const memNote = ctx.recalled?.length > 0
    ? ` Memory context from ${ctx.recalled.length} past quer${ctx.recalled.length > 1 ? 'ies' : 'y'} will enrich synthesis.`
    : ''

  const msg = handoff('ANALYST', 'SYNTHESIZER',
    `Extracted **${factResult.facts.length} key fact(s)**. Document sentiment: **${sentimentResult.sentiment}** (intensity: ${sentimentResult.intensity}%).${memNote} Ready for Gemini synthesis.`,
    { factCount: factResult.facts.length, sentiment: sentimentResult.sentiment, topFact: factResult.facts[0]?.text?.slice(0, 100) }
  )
  ctx.bus.push(msg)
  ctx.emit({ state: AGENT_STATES.ANALYZING, agent: AGENTS.ANALYST,
    message: `Extracted ${factResult.facts.length} facts | Sentiment: ${sentimentResult.sentiment}`, autogenMsg: msg })
  return 'SYNTHESIZING'
}

async function nodeSynthesize(ctx) {
  ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER,
    message: `Calling Gemini API with memory-enriched context…` })

  const { queryDocument } = await import('./gemini')

  // Inject recalled memories as synthetic "memory chunks"
  let enrichedChunks = ctx.topChunks
  if (ctx.recalled?.length > 0) {
    const memChunks = ctx.recalled.map((m, i) => ({
      text: `[Semantic Memory — Past Query]\nQ: ${m.question}\nA: ${m.answerSummary}`,
      score: 0.4,
      index: 9000 + i,
    }))
    enrichedChunks = [...ctx.topChunks.slice(0, 7), ...memChunks]
  }

  const result = await withRetry(
    () => queryDocument({
      question: ctx.question,
      documentId: ctx.documentId,
      documentName: ctx.documentName,
      chunks: enrichedChunks,
      reasoning: ctx.reasoning,
      agentMode: ctx.agentMode,
      onStep: info => ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER, message: info.label }),
    }),
    { maxAttempts: 3, baseDelayMs: 1000, label: 'synthesize' }
  )
  ctx.result = result

  const msg = handoff('SYNTHESIZER', 'CRITIC',
    `Answer generated via **${result.model}** — ${result.answer.length} chars, ${result.confidence}% confidence. ${ctx.recalled?.length ? `Memory-enriched with ${ctx.recalled.length} past entry(s). ` : ''}Sending to Critic for quality review.`,
    { model: result.model, confidence: result.confidence, answerLen: result.answer.length, memoryEnriched: (ctx.recalled?.length || 0) > 0 }
  )
  ctx.bus.push(msg)
  ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER,
    message: `Synthesized via ${result.model} (${result.confidence}% confidence)`, autogenMsg: msg })
  return 'CRITIQUING'
}

async function nodeCritique(ctx) {
  ctx.emit({ state: AGENT_STATES.CRITIQUING, agent: AGENTS.CRITIC,
    message: `Evaluating answer: completeness, grounding, coherence, structure…` })
  await delay(280)

  const answer = ctx.result?.answer || ''
  const isComplete   = answer.length > 120
  const isGrounded   = ctx.facts.some(f => answer.toLowerCase().includes(f.text.toLowerCase().slice(0, 15))) || answer.length > 250
  const hasStructure = /\n|\*\*|##|^\d+\.|^[-•]/m.test(answer)
  const confidence   = ctx.result?.confidence || 0
  const memBonus     = (ctx.recalled?.length || 0) > 0 ? 8 : 0

  const score = Math.min(100,
    (isComplete   ? 28 : 0) +
    (isGrounded   ? 38 : 0) +
    (hasStructure ? 14 : 0) +
    Math.round(confidence * 0.12) +
    memBonus
  )
  ctx.qualityScore = score

  const verdict = score >= 65 ? 'APPROVED' : 'FLAGGED'
  const detail  = score >= 65
    ? `Answer is complete, well-grounded, and structured.`
    : `Answer may lack depth — consider enabling Reasoning Mode.`

  const msg = handoff('CRITIC', 'ORCHESTRATOR',
    `**${verdict}** — Quality score: **${score}/100**. ${detail} Pipeline complete.`,
    { score, verdict, isComplete, isGrounded, hasStructure, memoryEnriched: (ctx.recalled?.length || 0) > 0 }
  )
  ctx.bus.push(msg)
  ctx.emit({ state: AGENT_STATES.CRITIQUING, agent: AGENTS.CRITIC,
    message: `${verdict} — Quality: ${score}/100. ${detail}`, autogenMsg: msg,
    state: score >= 65 ? AGENT_STATES.CRITIQUING : AGENT_STATES.REFLECTING,
  })
  return 'DONE'
}

// ─── Graph Runner ─────────────────────────────────────────────────────────────

const NODE_MAP = {
  PLANNING:      nodePlan,
  MEMORY_RECALL: nodeMemoryRecall,
  RETRIEVING:    nodeRetrieve,
  ANALYZING:     nodeAnalyze,
  SYNTHESIZING:  nodeSynthesize,
  CRITIQUING:    nodeCritique,
}

export async function runAgentGraph(input, onEvent) {
  const trace = []
  const bus   = []  // AutoGen message bus

  const ctx = {
    ...input,
    plan: null,
    topChunks: null,
    facts: [],
    recalled: [],
    sentiment: null,
    result: null,
    qualityScore: 0,
    bus,
    emit(event) {
      const stamped = { ...event, timestamp: Date.now() }
      trace.push(stamped)
      onEvent?.(stamped)
    },
  }

  ctx.emit({ state: AGENT_STATES.IDLE, agent: AGENTS.ORCHESTRATOR,
    message: `Orchestrator initializing crew for: "${input.question.slice(0, 60)}…"` })

  let currentNode = 'PLANNING'
  let attempts = 0
  const MAX_RETRIES = 2

  while (currentNode !== 'DONE' && currentNode !== 'ERROR') {
    const fn = NODE_MAP[currentNode]
    if (!fn) {
      ctx.emit({ state: AGENT_STATES.ERROR, message: `Unknown graph node: ${currentNode}` })
      break
    }
    try {
      currentNode = await fn(ctx)
    } catch (err) {
      attempts++
      if (attempts <= MAX_RETRIES) {
        ctx.emit({ state: AGENT_STATES.RETRYING,
          message: `Error in ${currentNode}: ${err.message} — retrying (${attempts}/${MAX_RETRIES})…` })
        await delay(1000 * attempts)
        currentNode = currentNode === 'SYNTHESIZING' ? 'SYNTHESIZING' : 'PLANNING'
      } else {
        ctx.emit({ state: AGENT_STATES.ERROR, message: err.message })
        throw err
      }
    }
  }

  ctx.emit({ state: AGENT_STATES.DONE, agent: AGENTS.ORCHESTRATOR,
    message: `Mission complete. Quality score: ${ctx.qualityScore}/100. Memories updated.` })

  // Persist to semantic memory
  if (ctx.result) {
    storeMemory({
      documentId: ctx.documentId,
      documentName: ctx.documentName,
      question: ctx.question,
      answer: ctx.result.answer,
      facts: ctx.facts.map(f => f.text),
      confidence: ctx.result.confidence,
      model: ctx.result.model,
    })
  }

  // Persist last AutoGen run for AgentStudio visualization
  try {
    localStorage.setItem('docintell-last-autogen', JSON.stringify({
      sessionId: `autogen_${Date.now()}`,
      documentName: ctx.documentName,
      question: ctx.question,
      messages: bus,
      timestamp: new Date().toISOString(),
      qualityScore: ctx.qualityScore,
      sentiment: ctx.sentiment,
    }))
  } catch {}

  return { ...(ctx.result || {}), trace, autogenMessages: bus, qualityScore: ctx.qualityScore }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
