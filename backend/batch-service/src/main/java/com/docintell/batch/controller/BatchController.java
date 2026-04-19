package com.docintell.batch.controller;

import com.docintell.batch.dto.RemoteDocument;
import com.docintell.batch.dto.TriggerBatchRequest;
import com.docintell.batch.model.BatchJobRecord;
import com.docintell.batch.repository.BatchJobRecordRepository;
import com.docintell.batch.service.DocumentSyncService;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/batch")
@CrossOrigin(origins = "${docintell.cors.allowed-origins:http://localhost:5173}")
public class BatchController {

    private final JobLauncher jobLauncher;
    private final Job documentProcessingJob;
    private final BatchJobRecordRepository jobRecordRepository;
    private final DocumentSyncService documentSyncService;

    public BatchController(JobLauncher jobLauncher,
                           Job documentProcessingJob,
                           BatchJobRecordRepository jobRecordRepository,
                           DocumentSyncService documentSyncService) {
        this.jobLauncher = jobLauncher;
        this.documentProcessingJob = documentProcessingJob;
        this.jobRecordRepository = jobRecordRepository;
        this.documentSyncService = documentSyncService;
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<BatchJobRecord>> getJobs() {
        return ResponseEntity.ok(jobRecordRepository.findAllByOrderByStartTimeDesc());
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerJob(@RequestBody TriggerBatchRequest request) {
        if (request.getDocumentId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "documentId is required"));
        }

        try {
            Long documentId = request.getDocumentId();
            RemoteDocument document = documentSyncService.getDocument(documentId);

            if (document == null || document.getStoragePath() == null || document.getStoragePath().isBlank()) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Document metadata is incomplete"));
            }

            JobParameters params = new JobParametersBuilder()
                    .addString("documentId", String.valueOf(documentId))
                    .addString("documentName", document.getName() == null ? "Document " + documentId : document.getName())
                    .addString("filePath", document.getStoragePath())
                    .addString("fileType", document.getType())
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            // Note: Job runs asynchronously normally, but Spring Boot defaults to SyncTaskExecutor.
            // In a production env, configure a SimpleAsyncTaskExecutor for JobLauncher.
            JobExecution execution = jobLauncher.run(documentProcessingJob, params);

            return ResponseEntity.ok(Map.of(
                    "status", execution.getStatus().name(),
                    "documentId", documentId,
                    "message", "Batch job configured and submitted"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
