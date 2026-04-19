package com.docintell.query.controller;

import com.docintell.query.dto.QueryRequest;
import com.docintell.query.dto.QueryResponse;
import com.docintell.query.repository.QueryRecordRepository;
import com.docintell.query.service.RagService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/query")
@CrossOrigin(origins = "${docintell.cors.allowed-origins:http://localhost:5173}")
public class QueryController {

    private final RagService ragService;
    private final QueryRecordRepository queryRepository;

    public QueryController(RagService ragService, QueryRecordRepository queryRepository) {
        this.ragService = ragService;
        this.queryRepository = queryRepository;
    }

    @PostMapping
    public ResponseEntity<QueryResponse> query(@Valid @RequestBody QueryRequest request) {
        QueryResponse response = ragService.executeQuery(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getQueryHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(queryRepository.findByUserIdOrderByTimestampDesc(userId));
    }
    
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getStats(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
                "totalQueries", queryRepository.countByUserId(userId)
        ));
    }
}
