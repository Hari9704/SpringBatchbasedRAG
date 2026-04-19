package com.docintell.batch.service;

import com.docintell.batch.model.DocumentChunk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Generates embeddings.
 * Uses Spring AI VectorStore (SimpleVectorStore for local development).
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final VectorStore vectorStore;
    
    @Value("${docintell.vectorstore.path:./data/vectors.json}")
    private String vectorStorePath;

    public EmbeddingService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void embedChunks(List<DocumentChunk> chunks) {
        log.info("Generating embeddings for {} chunks and saving to vector store...", chunks.size());

        try {
            List<Document> springAiDocs = chunks.stream().map(chunk -> {
                String metadataJson = chunk.getMetadata() != null ? chunk.getMetadata() : "{}";
                return new Document(
                        String.valueOf(chunk.getId() != null ? chunk.getId() : chunk.getChunkIndex()),
                        chunk.getContent(),
                        Map.of(
                                "documentId", chunk.getDocumentId(),
                                "chunkIndex", chunk.getChunkIndex(),
                                "metadata", metadataJson
                        )
                );
            }).collect(Collectors.toList());

            // This generates embeddings via Gemini and stores them in memory
            vectorStore.add(springAiDocs);
            
            // Persist SimpleVectorStore to disk
            if (vectorStore instanceof SimpleVectorStore simpleStore) {
                File file = new File(vectorStorePath);
                file.getParentFile().mkdirs();
                simpleStore.save(file);
                log.info("Persistent vector store saved to {}", file.getAbsolutePath());
            }

            // Update chunk states
            for (DocumentChunk chunk : chunks) {
                chunk.setEmbeddingId(String.valueOf(chunk.getId())); // ID used as vector ID
                chunk.setStatus(DocumentChunk.ChunkStatus.EMBEDDED);
            }

            log.info("Embedding generation completed successfully.");

        } catch (Exception e) {
            log.error("Failed to generate embeddings: {}", e.getMessage(), e);
            for (DocumentChunk chunk : chunks) {
                chunk.setStatus(DocumentChunk.ChunkStatus.FAILED);
            }
        }
    }
}
