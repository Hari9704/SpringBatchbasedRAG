package com.docintell.batch.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/batch")
@CrossOrigin(origins = "http://localhost:5173")
public class BatchController {

    @GetMapping("/jobs")
    public ResponseEntity<?> getJobs() {
        return ResponseEntity.ok(List.of(
            Map.of("id", "JOB-347", "name", "Q3 Report Processing", "status", "completed", "started", "13:02", "duration", "4.2s", "steps", "6/6"),
            Map.of("id", "JOB-346", "name", "Compliance Doc Reindex", "status", "running", "started", "12:58", "duration", "2.1s", "steps", "4/6"),
            Map.of("id", "JOB-345", "name", "Vendor Contract Batch", "status", "completed", "started", "12:45", "duration", "8.7s", "steps", "6/6"),
            Map.of("id", "JOB-344", "name", "SLA Embedding Update", "status", "failed", "started", "12:30", "duration", "1.3s", "steps", "2/6")
        ));
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerJob(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of(
            "jobId", "JOB-348",
            "status", "STARTED",
            "message", "Batch job triggered successfully"
        ));
    }

    @PostMapping("/retry/{jobId}")
    public ResponseEntity<?> retryJob(@PathVariable String jobId) {
        return ResponseEntity.ok(Map.of(
            "jobId", jobId,
            "status", "RETRYING",
            "message", "Job retry initiated"
        ));
    }
}
