package com.docintell.query.dto;

import java.util.List;
import java.util.Map;

public class QueryResponse {
    
    private Long queryId;
    private String answer;
    private int confidence;
    private List<Map<String, Object>> sources;
    private boolean reasoning;
    private List<Map<String, Object>> reasoningSteps;

    // --- Getters and Setters ---
    public Long getQueryId() { return queryId; }
    public void setQueryId(Long queryId) { this.queryId = queryId; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }
    public List<Map<String, Object>> getSources() { return sources; }
    public void setSources(List<Map<String, Object>> sources) { this.sources = sources; }
    public boolean isReasoning() { return reasoning; }
    public void setReasoning(boolean reasoning) { this.reasoning = reasoning; }
    public List<Map<String, Object>> getReasoningSteps() { return reasoningSteps; }
    public void setReasoningSteps(List<Map<String, Object>> reasoningSteps) { this.reasoningSteps = reasoningSteps; }
}
