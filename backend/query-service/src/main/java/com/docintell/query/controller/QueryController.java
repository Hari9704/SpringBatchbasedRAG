package com.docintell.query.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/query")
@CrossOrigin(origins = "http://localhost:5173")
public class QueryController {

    @PostMapping
    public ResponseEntity<?> query(@RequestBody Map<String, Object> request) {
        String question = (String) request.get("question");
        boolean reasoning = (boolean) request.getOrDefault("reasoning", false);
        boolean deepAnalysis = (boolean) request.getOrDefault("deepAnalysis", false);

        return ResponseEntity.ok(Map.of(
            "answer", "Based on the retrieved document context, here is the analysis for: \"" + question + "\"",
            "confidence", 94,
            "sources", List.of(
                Map.of("chunk", "Q3_Financial_Report.pdf — Chunk #18", "relevance", 97),
                Map.of("chunk", "Q3_Financial_Report.pdf — Chunk #19", "relevance", 94),
                Map.of("chunk", "Risk_Assessment_Q2.pdf — Chunk #7", "relevance", 82)
            ),
            "reasoning", reasoning,
            "deepAnalysis", deepAnalysis
        ));
    }

    @PostMapping("/reason")
    public ResponseEntity<?> getReasoningBreakdown(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of(
            "steps", List.of(
                Map.of("phase", "Query Decomposition", "details", List.of("Breaking query into sub-questions", "Identified 3 sub-queries")),
                Map.of("phase", "Context Retrieval", "details", List.of("Vector search with cosine similarity", "Retrieved 5 chunks from 2 documents")),
                Map.of("phase", "Intermediate Reasoning", "details", List.of("Chain-of-thought reasoning applied", "Cross-validated with historical data")),
                Map.of("phase", "Final Synthesis", "details", List.of("Combined insights from 3 reasoning steps", "Confidence: 94%"))
            )
        ));
    }
}
