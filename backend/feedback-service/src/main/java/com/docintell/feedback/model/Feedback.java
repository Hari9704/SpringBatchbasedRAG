package com.docintell.feedback.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long queryId;
    private String originalQuery;

    @Lob
    private String aiAnswer;

    @Lob
    private String editedAnswer;

    private int confidence;

    @Enumerated(EnumType.STRING)
    private FeedbackAction action;

    private LocalDateTime timestamp = LocalDateTime.now();
    private boolean reprocessed = false;

    public enum FeedbackAction { ACCEPTED, REJECTED, EDITED }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQueryId() { return queryId; }
    public void setQueryId(Long queryId) { this.queryId = queryId; }
    public String getOriginalQuery() { return originalQuery; }
    public void setOriginalQuery(String originalQuery) { this.originalQuery = originalQuery; }
    public String getAiAnswer() { return aiAnswer; }
    public void setAiAnswer(String aiAnswer) { this.aiAnswer = aiAnswer; }
    public String getEditedAnswer() { return editedAnswer; }
    public void setEditedAnswer(String editedAnswer) { this.editedAnswer = editedAnswer; }
    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }
    public FeedbackAction getAction() { return action; }
    public void setAction(FeedbackAction action) { this.action = action; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isReprocessed() { return reprocessed; }
    public void setReprocessed(boolean reprocessed) { this.reprocessed = reprocessed; }
}
