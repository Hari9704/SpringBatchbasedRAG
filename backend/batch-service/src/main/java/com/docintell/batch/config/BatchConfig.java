package com.docintell.batch.config;

import com.docintell.batch.model.BatchJobRecord;
import com.docintell.batch.model.DocumentChunk;
import com.docintell.batch.repository.BatchJobRecordRepository;
import com.docintell.batch.repository.DocumentChunkRepository;
import com.docintell.batch.service.DocumentSyncService;
import com.docintell.batch.service.EmbeddingService;
import com.docintell.batch.service.SmartChunkingService;
import com.docintell.batch.service.TextCleanerService;
import com.docintell.batch.service.TextExtractorService;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class BatchConfig {

    private final TextExtractorService textExtractor;
    private final TextCleanerService textCleaner;
    private final SmartChunkingService chunkingService;
    private final EmbeddingService embeddingService;
    private final DocumentChunkRepository chunkRepository;
    private final BatchJobRecordRepository jobRecordRepository;
    private final DocumentSyncService documentSyncService;

    public BatchConfig(TextExtractorService textExtractor, TextCleanerService textCleaner,
                       SmartChunkingService chunkingService, EmbeddingService embeddingService,
                       DocumentChunkRepository chunkRepository,
                       BatchJobRecordRepository jobRecordRepository,
                       DocumentSyncService documentSyncService) {
        this.textExtractor = textExtractor;
        this.textCleaner = textCleaner;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
        this.chunkRepository = chunkRepository;
        this.jobRecordRepository = jobRecordRepository;
        this.documentSyncService = documentSyncService;
    }

    @Bean
    public Job documentProcessingJob(JobRepository jobRepository, Step initializeJobStep,
                                     Step extractTextStep, Step cleanTextStep,
                                     Step chunkTextStep, Step generateEmbeddingsStep,
                                     Step finalizeJobStep,
                                     JobExecutionListener documentProcessingJobListener) {
        return new JobBuilder("documentProcessingJob", jobRepository)
                .listener(documentProcessingJobListener)
                .start(initializeJobStep)
                .next(extractTextStep)
                .next(cleanTextStep)
                .next(chunkTextStep)
                .next(generateEmbeddingsStep)
                .next(finalizeJobStep)
                .build();
    }

    @Bean
    public JobExecutionListener documentProcessingJobListener() {
        return new JobExecutionListener() {
            @Override
            public void beforeJob(JobExecution jobExecution) {
                // No-op
            }

            @Override
            public void afterJob(JobExecution jobExecution) {
                if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
                    return;
                }

                String documentIdValue = jobExecution.getJobParameters().getString("documentId");
                if (documentIdValue == null) {
                    return;
                }

                Long documentId = Long.valueOf(documentIdValue);
                long chunkCount = chunkRepository.countByDocumentId(documentId);
                Object recordIdValue = jobExecution.getExecutionContext().get("jobRecordId");
                Long recordId = toJobRecordId(recordIdValue);

                if (recordId != null) {
                    BatchJobRecord record = jobRecordRepository.findById(recordId).orElse(null);
                    if (record != null) {
                        record.setStatus(BatchJobRecord.JobStatus.FAILED);
                        record.setCurrentStep("Failed");
                        record.setEndTime(LocalDateTime.now());
                        record.setErrorMessage(jobExecution.getAllFailureExceptions().stream()
                                .map(Throwable::getMessage)
                                .filter(message -> message != null && !message.isBlank())
                                .collect(Collectors.joining("\n")));
                        jobRecordRepository.save(record);
                    }
                }

                documentSyncService.markFailed(documentId, (int) chunkCount);
            }
        };
    }

    @Bean
    @StepScope
    public Step initializeJobStep(JobRepository jobRepository,
                                  PlatformTransactionManager txManager,
                                  @Value("#{jobParameters['documentName']}") String documentName,
                                  @Value("#{jobParameters['documentId']}") String documentIdStr) {
        return new StepBuilder("initializeJob", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    Long docId = Long.valueOf(documentIdStr);

                    BatchJobRecord record = new BatchJobRecord();
                    record.setDocumentId(docId);
                    record.setDocumentName(documentName);
                    record.setStatus(BatchJobRecord.JobStatus.RUNNING);
                    record.setCurrentStep("Validating document");
                    jobRecordRepository.save(record);

                    chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().put("jobRecordId", record.getId());
                    documentSyncService.updateProcessingState(docId, "VALIDATING", null, null);
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step extractTextStep(JobRepository jobRepository, PlatformTransactionManager txManager,
                                @Value("#{jobParameters['filePath']}") String filePath,
                                @Value("#{jobParameters['fileType']}") String fileType) {
        return new StepBuilder("extractText", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    updateJobStepDetails(chunkContext, "Extracting text", "EXTRACTING");

                    if (!Files.exists(Path.of(filePath))) {
                        throw new RuntimeException("File not found: " + filePath);
                    }

                    String rawText = textExtractor.extract(filePath, fileType);
                    chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().put("rawText", rawText);

                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step cleanTextStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("cleanText", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    updateJobStepDetails(chunkContext, "Cleaning text", "CLEANING");

                    String rawText = (String) chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("rawText");
                    String cleanedText = textCleaner.clean(rawText);
                    cleanedText = textCleaner.deduplicateParagraphs(cleanedText);

                    chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().put("cleanedText", cleanedText);
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step chunkTextStep(JobRepository jobRepository, PlatformTransactionManager txManager,
                              @Value("#{jobParameters['documentId']}") String documentIdStr) {
        return new StepBuilder("chunkText", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    updateJobStepDetails(chunkContext, "Chunking document", "CHUNKING");

                    Long documentId = Long.valueOf(documentIdStr);
                    String cleanedText = (String) chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("cleanedText");

                    chunkRepository.deleteByDocumentId(documentId); // Clear old chunks if retry

                    List<DocumentChunk> chunks = chunkingService.chunk(documentId, cleanedText);
                    chunkRepository.saveAll(chunks);

                    chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().put("chunkCount", chunks.size());
                    documentSyncService.updateProcessingState(documentId, "CHUNKING", chunks.size(), null);

                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step generateEmbeddingsStep(JobRepository jobRepository, PlatformTransactionManager txManager,
                                       @Value("#{jobParameters['documentId']}") String documentIdStr) {
        return new StepBuilder("generateEmbeddings", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    updateJobStepDetails(chunkContext, "Generating embeddings", "EMBEDDING");

                    Long documentId = Long.valueOf(documentIdStr);
                    List<DocumentChunk> chunks = chunkRepository.findByDocumentIdAndStatus(documentId, DocumentChunk.ChunkStatus.CLEANED);

                    try {
                        embeddingService.embedChunks(chunks);
                    } finally {
                        chunkRepository.saveAll(chunks);
                    }

                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step finalizeJobStep(JobRepository jobRepository,
                                PlatformTransactionManager txManager,
                                @Value("#{jobParameters['documentId']}") String documentIdStr) {
        return new StepBuilder("finalizeJob", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    updateJobStepDetails(chunkContext, "Finalizing job", null);

                    Long documentId = Long.valueOf(documentIdStr);
                    Long recordId = toJobRecordId(chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("jobRecordId"));
                    if (recordId == null) {
                        throw new IllegalStateException("jobRecordId missing from job execution context");
                    }
                    BatchJobRecord record = jobRecordRepository.findById(recordId).orElseThrow();

                    int chunkCount = (int) chunkRepository.countByDocumentId(documentId);
                    record.setStatus(BatchJobRecord.JobStatus.COMPLETED);
                    record.setCurrentStep("Finished");
                    record.setCompletedSteps(record.getTotalSteps());
                    record.setEndTime(LocalDateTime.now());

                    jobRecordRepository.save(record);
                    documentSyncService.markProcessed(documentId, chunkCount);

                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    private void updateJobStepDetails(org.springframework.batch.core.scope.context.ChunkContext chunkContext,
                                      String stepName,
                                      String documentStatus) {
        Long recordId = toJobRecordId(chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("jobRecordId"));
        if (recordId != null) {
            BatchJobRecord record = jobRecordRepository.findById(recordId).orElseThrow();
            record.setStatus(BatchJobRecord.JobStatus.RUNNING);
            record.setCurrentStep(stepName);
            record.setCompletedSteps(record.getCompletedSteps() + 1);
            jobRecordRepository.save(record);
        }

        if (documentStatus != null) {
            String documentIdValue = (String) chunkContext.getStepContext().getJobParameters().get("documentId");
            if (documentIdValue != null) {
                documentSyncService.updateProcessingState(Long.valueOf(documentIdValue), documentStatus, null, null);
            }
        }
    }

    /**
     * Job execution context values may deserialize as Long, Integer, or String depending on persistence layer.
     */
    private static Long toJobRecordId(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Long l) {
            return l;
        }
        if (value instanceof Number n) {
            return n.longValue();
        }
        if (value instanceof String s && !s.isBlank()) {
            try {
                return Long.parseLong(s.trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
