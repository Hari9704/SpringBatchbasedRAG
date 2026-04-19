package com.docintell.query.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class QueryRequest {

    private Long userId = 1L; // default for dev
    private Long documentId;

    @NotBlank(message = "Question cannot be empty")
    private String question;

    private boolean reasoning = false;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public boolean isReasoning() { return reasoning; }
    public void setReasoning(boolean reasoning) { this.reasoning = reasoning; }
}
