/**
 * DocIntell Agent Engine — LangGraph-inspired state machine
 *
 * Concepts implemented:
 * - LangGraph: stateful graph with nodes (steps) and edges (transitions)
 * - CrewAI: multiple specialized "agents" (Planner, Retriever, Analyst, Synthesizer)
 * - AutoGen: agents communicate via structured messages
 * - MCP: tool registry each agent can call
 */

import { withRetry } from './gemini'
import { TOOLS, executeTool } from './tools'
import { isBackendAvailable, backendRagQuery } from './api'

// ─── State Machine ─────────────────────────────────────────────────────────────

export const AGENT_STATES = {
  IDLE:        'IDLE',
  PLANNING:    'PLANNING',
  RETRIEVING:  'RETRIEVING',
  ANALYZING:   'ANALYZING',
  TOOL_CALL:   'TOOL_CALL',
  REFLECTING:  'REFLECTING',
  SYNTHESIZING:'SYNTHESIZING',
  DONE:        'DONE',
  ERROR:       'ERROR',
  RETRYING:    'RETRYING',
}

// Each "crew member" maps to a stage in the graph
const AGENTS = {
  PLANNER:    { name: 'Planner Agent',    emoji: '🗺️',  desc: 'Breaks down the question into a structured query plan.' },
  RETRIEVER:  { name: 'Retriever Agent',  emoji: '🔍',  desc: 'Retrieves the most relevant document chunks (MCP: searchChunks).' },
  ANALYST:    { name: 'Analyst Agent',    emoji: '🧪',  desc: 'Analyzes evidence and extracts key facts.' },
  SYNTHESIZER:{ name: 'Synthesizer Agent',emoji: '✍️',  desc: 'Synthesizes findings into a final answer.' },
}

// ─── Graph Nodes ───────────────────────────────────────────────────────────────

async function nodePlan(ctx) {
  ctx.emit({ state: AGENT_STATES.PLANNING, agent: AGENTS.PLANNER,
    message: `Decomposing question into a query plan…` })
  await delay(300)

  const keywords = ctx.question
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3)
    .slice(0, 8)

  ctx.plan = {
    keywords,
    queryType: ctx.question.split(' ').length < 6 ? 'factual' : 'analytical',
    needsReasoning: ctx.reasoning || ctx.agentMode,
  }

  ctx.emit({ state: AGENT_STATES.PLANNING, agent: AGENTS.PLANNER,
    message: `Plan ready — type: ${ctx.plan.queryType}, keywords: ${keywords.slice(0, 4).join(', ')}` })
  return 'RETRIEVING'
}

async function nodeRetrieve(ctx) {
  if (isBackendAvailable()) {
    ctx.emit({ state: AGENT_STATES.RETRIEVING, agent: AGENTS.RETRIEVER,
      message: `Calling backend vector search (Spring AI / pgvector) at ${import.meta.env.VITE_API_BASE_URL}/api/query…` })

    const backendResult = await backendRagQuery({
      documentId: ctx.documentId,
      question: ctx.question,
      reasoning: ctx.reasoning || false,
    })

    ctx.backendResult = backendResult

    const sources = backendResult.sources || []
    ctx.topChunks = sources.map((s, i) => ({
      text: s.chunk || '',
      index: typeof s.chunkIndex === 'number' ? s.chunkIndex : i,
      score: s.relevance === 'High' ? 1 : 0.5,
      documentId: s.documentId,
    }))

    ctx.emit({ state: AGENT_STATES.RETRIEVING, agent: AGENTS.RETRIEVER,
      message: `Backend vector search complete — ${sources.length} semantically similar chunk(s) retrieved (confidence: ${backendResult.confidence}%)` })
  } else {
    ctx.emit({ state: AGENT_STATES.RETRIEVING, agent: AGENTS.RETRIEVER,
      message: `Searching document chunks with MCP tool: searchChunks (local keyword scorer)…` })

    const result = await executeTool('searchChunks', {
      chunks: ctx.chunks,
      query: ctx.question,
      keywords: ctx.plan?.keywords || [],
      topK: 8,
    })

    ctx.topChunks = result.chunks
    ctx.emit({ state: AGENT_STATES.RETRIEVING, agent: AGENTS.RETRIEVER,
      message: `Retrieved ${result.chunks.length} relevant chunks via local scorer (top score: ${result.topScore})` })
  }

  return 'ANALYZING'
}

async function nodeAnalyze(ctx) {
  ctx.emit({ state: AGENT_STATES.ANALYZING, agent: AGENTS.ANALYST,
    message: `Extracting key facts from retrieved chunks…` })

  const result = await executeTool('extractFacts', {
    chunks: ctx.topChunks,
    question: ctx.question,
  })

  ctx.facts = result.facts
  ctx.emit({ state: AGENT_STATES.ANALYZING, agent: AGENTS.ANALYST,
    message: `Identified ${result.facts.length} relevant fact(s) from document` })
  return 'SYNTHESIZING'
}

async function nodeSynthesize(ctx) {
  if (ctx.backendResult) {
    ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER,
      message: `Using backend RAG answer (Spring AI + Gemini on server) — skipping duplicate client-side LLM call…` })

    ctx.result = {
      answer: ctx.backendResult.answer,
      confidence: ctx.backendResult.confidence ?? 90,
      sources: (ctx.backendResult.sources || []).map(s => ({
        documentId: s.documentId,
        chunkIndex: s.chunkIndex,
        chunk: s.chunk,
        relevance: s.relevance,
      })),
      model: 'backend/spring-ai',
      queryId: ctx.backendResult.queryId,
    }

    ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER,
      message: `Answer delivered from backend RAG pipeline (confidence: ${ctx.result.confidence}%)` })
    return 'DONE'
  }

  ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER,
    message: `Calling Gemini API to synthesize the final answer…` })

  const { queryDocument } = await import('./gemini')

  const onStep = (info) => {
    ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER, message: info.label })
  }

  const result = await withRetry(
    () => queryDocument({
      question: ctx.question,
      documentId: ctx.documentId,
      documentName: ctx.documentName,
      chunks: ctx.topChunks,
      reasoning: ctx.reasoning,
      agentMode: ctx.agentMode,
      onStep,
    }),
    { maxAttempts: 3, baseDelayMs: 1000, label: 'synthesize' }
  )

  ctx.result = result
  ctx.emit({ state: AGENT_STATES.SYNTHESIZING, agent: AGENTS.SYNTHESIZER,
    message: `Answer synthesized via ${result.model} (confidence: ${result.confidence}%)` })
  return 'DONE'
}

// ─── Graph Runner ──────────────────────────────────────────────────────────────

const NODE_MAP = {
  PLANNING:    nodePlan,
  RETRIEVING:  nodeRetrieve,
  ANALYZING:   nodeAnalyze,
  SYNTHESIZING: nodeSynthesize,
}

/**
 * Run the full agent graph.
 * @param {object} input - { question, documentId, documentName, chunks, reasoning, agentMode }
 * @param {function} onEvent - called with each { state, agent, message } update
 * @returns {object} - { answer, confidence, sources, model, trace }
 */
export async function runAgentGraph(input, onEvent) {
  const trace = []
  const ctx = {
    ...input,
    plan: null,
    topChunks: null,
    facts: [],
    result: null,
    emit(event) {
      trace.push({ ...event, timestamp: Date.now() })
      onEvent?.(event)
    },
  }

  ctx.emit({ state: AGENT_STATES.IDLE, message: 'Agent graph initialized.' })

  let currentNode = 'PLANNING'
  let attempts = 0
  const MAX_RETRIES = 2

  while (currentNode !== 'DONE' && currentNode !== 'ERROR') {
    const nodeFn = NODE_MAP[currentNode]
    if (!nodeFn) {
      ctx.emit({ state: AGENT_STATES.ERROR, message: `Unknown node: ${currentNode}` })
      break
    }

    try {
      currentNode = await nodeFn(ctx)
    } catch (err) {
      attempts++
      if (attempts <= MAX_RETRIES) {
        ctx.emit({
          state: AGENT_STATES.RETRYING,
          message: `Error in ${currentNode}: ${err.message} — retrying (${attempts}/${MAX_RETRIES})…`,
        })
        await delay(1000 * attempts)
        // Retry the same node that failed (don't restart the whole graph)
        // currentNode is unchanged — loop continues with same node
      } else {
        ctx.emit({ state: AGENT_STATES.ERROR, message: err.message })
        throw err
      }
    }
  }

  ctx.emit({ state: AGENT_STATES.DONE, message: 'Agent graph complete.' })

  return {
    ...(ctx.result || {}),
    trace,
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

export { AGENTS }
