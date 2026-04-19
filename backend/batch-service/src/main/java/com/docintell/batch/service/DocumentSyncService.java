package com.docintell.batch.service;

import com.docintell.batch.dto.DocumentProcessingUpdateRequest;
import com.docintell.batch.dto.RemoteDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;

@Service
public class DocumentSyncService {

    private final RestClient restClient;

    public DocumentSyncService(RestClient.Builder restClientBuilder,
                               @Value("${docintell.services.document-service-url:http://localhost:8082}") String documentServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(documentServiceUrl).build();
    }

    public RemoteDocument getDocument(Long documentId) {
        return restClient.get()
                .uri("/api/documents/{id}", documentId)
                .retrieve()
                .body(RemoteDocument.class);
    }

    public void updateProcessingState(Long documentId, String status, Integer chunks, LocalDateTime processedDate) {
        DocumentProcessingUpdateRequest request = new DocumentProcessingUpdateRequest();
        request.setStatus(status);
        request.setChunks(chunks);
        request.setProcessedDate(processedDate);

        restClient.patch()
                .uri("/api/documents/{id}/processing", documentId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }

    public void markProcessed(Long documentId, Integer chunks) {
        updateProcessingState(documentId, "PROCESSED", chunks, LocalDateTime.now());
    }

    public void markFailed(Long documentId, Integer chunks) {
        updateProcessingState(documentId, "FAILED", chunks, null);
    }
}
