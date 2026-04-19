package com.docintell.batch.controller;

import com.docintell.batch.model.BatchJobRecord;
import com.docintell.batch.repository.BatchJobRecordRepository;
import org.springframework.batch.core.Job;
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

    public BatchController(JobLauncher jobLauncher, Job documentProcessingJob, BatchJobRecordRepository jobRecordRepository) {
        this.jobLauncher = jobLauncher;
        this.documentProcessingJob = documentProcessingJob;
        this.jobRecordRepository = jobRecordRepository;
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<BatchJobRecord>> getJobs() {
        return ResponseEntity.ok(jobRecordRepository.findAllByOrderByStartTimeDesc());
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerJob(@RequestBody Map<String, String> request) {
        try {
            Long documentId = Long.valueOf(request.get("documentId"));
            String filePath = request.get("filePath");
            String fileType = request.get("fileType");

            JobParameters params = new JobParametersBuilder()
                    .addString("documentId", String.valueOf(documentId))
                    .addString("filePath", filePath)
                    .addString("fileType", fileType)
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            // Note: Job runs asynchronously normally, but Spring Boot defaults to SyncTaskExecutor.
            // In a production env, configure a SimpleAsyncTaskExecutor for JobLauncher.
            jobLauncher.run(documentProcessingJob, params);

            return ResponseEntity.ok(Map.of(
                    "status", "STARTED",
                    "message", "Batch job configured and submitted to queue"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
