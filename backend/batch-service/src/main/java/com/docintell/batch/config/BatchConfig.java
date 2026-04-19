package com.docintell.batch.config;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class BatchConfig {

    @Bean
    public Job documentProcessingJob(JobRepository jobRepository, Step validateStep, Step extractStep,
                                      Step chunkStep, Step embedStep, Step storeStep, Step updateStep) {
        return new JobBuilder("documentProcessingJob", jobRepository)
                .start(validateStep)
                .next(extractStep)
                .next(chunkStep)
                .next(embedStep)
                .next(storeStep)
                .next(updateStep)
                .build();
    }

    @Bean
    public Step validateStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("fileValidation", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 1: File Validation — Format and size check");
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    public Step extractStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("textExtraction", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 2: Text Extraction — Parsing document content");
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    public Step chunkStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("chunking", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 3: Chunking — Splitting into semantic chunks");
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    public Step embedStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("embeddingGeneration", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 4: Embedding Generation — Creating vector embeddings");
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    public Step storeStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("vectorStorage", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 5: Vector Storage — Storing in vector database");
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }

    @Bean
    public Step updateStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("metadataUpdate", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 6: Metadata Update — Updating document records");
                    return RepeatStatus.FINISHED;
                }, txManager).build();
    }
}
