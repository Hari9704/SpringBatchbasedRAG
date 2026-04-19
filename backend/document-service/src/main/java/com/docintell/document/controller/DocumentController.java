package com.docintell.document.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    @GetMapping
    public ResponseEntity<?> getAllDocuments() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "name", "Q3_Financial_Report.pdf", "type", "PDF", "size", "2.4 MB", "version", "v3", "status", "Processed", "chunks", 23, "date", "2026-04-18"),
            Map.of("id", 2, "name", "Compliance_Guidelines_v2.docx", "type", "DOCX", "size", "1.1 MB", "version", "v2", "status", "Processed", "chunks", 15, "date", "2026-04-17"),
            Map.of("id", 3, "name", "SLA_Agreement_2026.pdf", "type", "PDF", "size", "3.8 MB", "version", "v2", "status", "Processed", "chunks", 42, "date", "2026-04-16")
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
            "id", id, "name", "Q3_Financial_Report.pdf", "type", "PDF",
            "content", "Quarterly Financial Report Q3 2026...", "status", "Processed"
        ));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of(
            "message", "File uploaded successfully",
            "filename", file.getOriginalFilename(),
            "size", file.getSize(),
            "status", "PROCESSING"
        ));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<?> getVersions(@PathVariable Long id) {
        return ResponseEntity.ok(List.of(
            Map.of("version", "v3", "date", "2026-04-18", "changes", "12% content updated"),
            Map.of("version", "v2", "date", "2026-04-10", "changes", "Added risk section"),
            Map.of("version", "v1", "date", "2026-03-28", "changes", "Initial version")
        ));
    }
}
