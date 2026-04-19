package com.docintell.document.controller;

import com.docintell.document.dto.DocumentProcessingUpdateRequest;
import com.docintell.document.model.Document;
import com.docintell.document.repository.DocumentRepository;
import com.docintell.document.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "${docintell.cors.allowed-origins:http://localhost:5173}")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;

    public DocumentController(DocumentService documentService, DocumentRepository documentRepository) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        try {
            Document doc = documentService.upload(file, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", doc.getId(),
                    "name", doc.getName(),
                    "type", doc.getType(),
                    "sizeBytes", doc.getSizeBytes(),
                    "status", doc.getStatus().name(),
                    "message", "Upload successful. Processing will begin shortly."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store file"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Document>> getUserDocuments(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(documentService.getUserDocuments(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(documentService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/processing")
    public ResponseEntity<?> updateProcessingState(@PathVariable Long id,
                                                   @RequestBody DocumentProcessingUpdateRequest request) {
        if (request.getStatus() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }

        try {
            Document updated = documentService.updateProcessingState(
                    id,
                    request.getStatus(),
                    request.getChunks(),
                    request.getProcessedDate()
            );
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id,
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        try {
            documentService.deleteDocument(id, userId);
            return ResponseEntity.ok(Map.of("message", "Document deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(Map.of(
                "totalDocuments", documentService.countByUser(userId),
                "processedDocuments", documentService.countProcessedByUser(userId)
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentRepository.findAll());
    }
}
