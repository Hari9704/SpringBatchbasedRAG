package com.docintell.batch.config;

import com.docintell.batch.model.BatchJobRecord;
import com.docintell.batch.model.DocumentChunk;
import com.docintell.batch.repository.BatchJobRecordRepository;
import com.docintell.batch.repository.DocumentChunkRepository;
import com.docintell.batch.service.EmbeddingService;
import com.docintell.batch.service.SmartChunkingService;
import com.docintell.batch.service.TextCleanerService;
import com.docintell.batch.service.TextExtractorService;
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

@Configuration
public class BatchConfig {

    private final TextExtractorService textExtractor;
    private final TextCleanerService textCleaner;
    private final SmartChunkingService chunkingService;
    private final EmbeddingService embeddingService;
    private final DocumentChunkRepository chunkRepository;
    private final BatchJobRecordRepository jobRecordRepository;

    public BatchConfig(TextExtractorService textExtractor, TextCleanerService textCleaner,
                       SmartChunkingService chunkingService, EmbeddingService embeddingService,
                       DocumentChunkRepository chunkRepository, BatchJobRecordRepository jobRecordRepository) {
        this.textExtractor = textExtractor;
        this.textCleaner = textCleaner;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
        this.chunkRepository = chunkRepository;
        this.jobRecordRepository = jobRecordRepository;
    }

    @Bean
    public Job documentProcessingJob(JobRepository jobRepository, Step initializeJobStep,
                                     Step extractTextStep, Step cleanTextStep,
                                     Step chunkTextStep, Step generateEmbeddingsStep,
                                     Step finalizeJobStep) {
        return new JobBuilder("documentProcessingJob", jobRepository)
                .start(initializeJobStep)
                .next(extractTextStep)
                .next(cleanTextStep)
                .next(chunkTextStep)
                .next(generateEmbeddingsStep)
                .next(finalizeJobStep)
                .build();
    }

    @Bean
    @StepScope
    public Step initializeJobStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("initializeJob", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    String docIdStr = (String) chunkContext.getStepContext().getJobParameters().get("documentId");
                    Long docId = Long.valueOf(docIdStr);
                    
                    BatchJobRecord record = new BatchJobRecord();
                    record.setDocumentId(docId);
                    record.setStatus(BatchJobRecord.JobStatus.RUNNING);
                    record.setCurrentStep("Initialization");
                    jobRecordRepository.save(record);
                    
                    chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().put("jobRecordId", record.getId());
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
                    updateJobStepDetails(chunkContext, "Extract Text");
                    
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
                    updateJobStepDetails(chunkContext, "Clean & Normalize Text");
                    
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
                    updateJobStepDetails(chunkContext, "Smart Chunking");
                    
                    Long documentId = Long.valueOf(documentIdStr);
                    String cleanedText = (String) chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("cleanedText");
                    
                    chunkRepository.deleteByDocumentId(documentId); // Clear old chunks if retry
                    
                    List<DocumentChunk> chunks = chunkingService.chunk(documentId, cleanedText);
                    chunkRepository.saveAll(chunks);
                    
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step generateEmbeddingsStep(JobRepository jobRepository, PlatformTransactionManager txManager,
                                       @Value("#{jobParameters['documentId']}") String documentIdStr) {
        return new StepBuilder("generateEmbeddings", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    updateJobStepDetails(chunkContext, "Generate Embeddings");
                    
                    Long documentId = Long.valueOf(documentIdStr);
                    List<DocumentChunk> chunks = chunkRepository.findByDocumentIdAndStatus(documentId, DocumentChunk.ChunkStatus.CLEANED);
                    
                    embeddingService.embedChunks(chunks);
                    chunkRepository.saveAll(chunks); // Save updated statuses + vector IDs
                    
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    @StepScope
    public Step finalizeJobStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("finalizeJob", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    Long recordId = (Long) chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("jobRecordId");
                    BatchJobRecord record = jobRecordRepository.findById(recordId).orElseThrow();
                    
                    record.setStatus(BatchJobRecord.JobStatus.COMPLETED);
                    record.setCurrentStep("Finished");
                    record.setCompletedSteps(record.getTotalSteps());
                    record.setEndTime(LocalDateTime.now());
                    
                    jobRecordRepository.save(record);
                    
                    // TODO: Call Document-Service (or use event bus/Kafka) to update Document status to PROCESSED
                    
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    private void updateJobStepDetails(org.springframework.batch.core.scope.context.ChunkContext chunkContext, String stepName) {
        Long recordId = (Long) chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext().get("jobRecordId");
        if (recordId != null) {
            BatchJobRecord record = jobRecordRepository.findById(recordId).orElseThrow();
            record.setCurrentStep(stepName);
            record.setCompletedSteps(record.getCompletedSteps() + 1);
            jobRecordRepository.save(record);
        }
    }
}
