package com.docintell.analytics.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    @GetMapping
    public ResponseEntity<?> getAnalytics() {
        return ResponseEntity.ok(Map.of(
            "querySuccessRate", 93.4,
            "avgConfidence", 91,
            "feedbackScore", 4.6,
            "selfImprovement", 12,
            "queryTrend", List.of(
                Map.of("day", "Mon", "queries", 12, "success", 11),
                Map.of("day", "Tue", "queries", 19, "success", 17),
                Map.of("day", "Wed", "queries", 15, "success", 14),
                Map.of("day", "Thu", "queries", 22, "success", 20),
                Map.of("day", "Fri", "queries", 28, "success", 26)
            ),
            "confidenceTrend", List.of(
                Map.of("week", "W1", "confidence", 78),
                Map.of("week", "W4", "confidence", 85),
                Map.of("week", "W7", "confidence", 91)
            ),
            "topTopics", List.of(
                Map.of("topic", "Financial Reports", "count", 34),
                Map.of("topic", "Compliance", "count", 28),
                Map.of("topic", "Risk Assessment", "count", 22)
            )
        ));
    }

    @GetMapping("/feedback-trends")
    public ResponseEntity<?> getFeedbackTrends() {
        return ResponseEntity.ok(List.of(
            Map.of("month", "Jan", "accepted", 62, "rejected", 22, "edited", 8),
            Map.of("month", "Feb", "accepted", 70, "rejected", 18, "edited", 10),
            Map.of("month", "Mar", "accepted", 78, "rejected", 14, "edited", 12),
            Map.of("month", "Apr", "accepted", 85, "rejected", 8, "edited", 6)
        ));
    }
}
