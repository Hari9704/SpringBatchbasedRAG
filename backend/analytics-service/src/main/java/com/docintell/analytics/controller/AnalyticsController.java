package com.docintell.analytics.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "${docintell.cors.allowed-origins:http://localhost:5173}")
public class AnalyticsController {

    // Normally this service would use WebClient or FeignClient to fetch data from Document, Query, and Feedback services.
    // For this demonstration step, we will provide structured data matching the new DTO formats.
    
    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardStats(@RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(Map.of(
            "documents", Map.of("total", 12, "processed", 10),
            "queries", Map.of("total", 47, "last30Days", 35),
            "accuracy", Map.of("value", 93, "trend", "positive")
        ));
    }

    @GetMapping("/trend")
    public ResponseEntity<?> getQueryTrend() {
        return ResponseEntity.ok(List.of(
            Map.of("day", "Mon", "queries", 4),
            Map.of("day", "Tue", "queries", 7),
            Map.of("day", "Wed", "queries", 5),
            Map.of("day", "Thu", "queries", 9),
            Map.of("day", "Fri", "queries", 12),
            Map.of("day", "Sat", "queries", 3),
            Map.of("day", "Sun", "queries", 7)
        ));
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> getFeedbackStats() {
        return ResponseEntity.ok(List.of(
            Map.of("name", "Accepted", "value", 28, "color", "#10b981"),
            Map.of("name", "Edited", "value", 4, "color", "#f59e0b"),
            Map.of("name", "Rejected", "value", 2, "color", "#ef4444")
        ));
    }
}
