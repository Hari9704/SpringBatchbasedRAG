package com.docintell.batch.service;

import com.docintell.batch.model.DocumentChunk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Generates embeddings.
 * Placeholder for Spring AI + Gemini or Supabase pgvector integration.
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    // TODO: Inject Spring AI EmbeddingModel here once Vector DB is decided
    // private final EmbeddingModel embeddingModel;

    public void embedChunks(List<DocumentChunk> chunks) {
        log.info("Generating embeddings for {} chunks...", chunks.size());

        for (DocumentChunk chunk : chunks) {
            try {
                // TODO: Call Gemini API via Spring AI
                // List<Double> vector = embeddingModel.embed(chunk.getContent());
                
                // Simulate processing time
                Thread.sleep(50);
                
                // Mock embedding ID that would point to Vector DB
                chunk.setEmbeddingId(UUID.randomUUID().toString());
                chunk.setStatus(DocumentChunk.ChunkStatus.EMBEDDED);
                
            } catch (Exception e) {
                log.error("Failed to embed chunk {}: {}", chunk.getChunkIndex(), e.getMessage());
                chunk.setStatus(DocumentChunk.ChunkStatus.FAILED);
            }
        }
        
        log.info("Embedding generation completed.");
    }
}
