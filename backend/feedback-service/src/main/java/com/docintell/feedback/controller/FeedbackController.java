package com.docintell.feedback.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {

    @GetMapping
    public ResponseEntity<?> getFeedback() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "query", "What are the key risks in Q3 report?", "answer", "4 key risk factors identified", "confidence", 94, "feedback", "accepted"),
            Map.of("id", 2, "query", "Summarize the compliance clauses", "answer", "12 key clauses covering data protection", "confidence", 88, "feedback", "pending"),
            Map.of("id", 3, "query", "What is the total contract value?", "answer", "$8.4M annually", "confidence", 72, "feedback", "rejected")
        ));
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> feedback) {
        return ResponseEntity.ok(Map.of(
            "message", "Feedback recorded successfully",
            "queryId", feedback.get("queryId"),
            "action", feedback.get("action"),
            "reprocessingTriggered", feedback.get("action").equals("rejected")
        ));
    }

    @PostMapping("/reprocess")
    public ResponseEntity<?> triggerReprocessing() {
        return ResponseEntity.ok(Map.of(
            "message", "Batch reprocessing triggered based on feedback",
            "jobId", "REPROCESS-" + System.currentTimeMillis(),
            "status", "STARTED"
        ));
    }
}
