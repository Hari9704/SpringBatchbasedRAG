package com.docintell.batch.service;

import com.docintell.batch.model.DocumentChunk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Smart Chunking — the core differentiator.
 * Splits text into optimized chunks while respecting sentence and paragraph boundaries.
 */
@Service
public class SmartChunkingService {

    private static final Logger log = LoggerFactory.getLogger(SmartChunkingService.class);

    private final int targetSize;
    private final int overlap;

    public SmartChunkingService(
            @Value("${docintell.chunking.target-size:512}") int targetSize,
            @Value("${docintell.chunking.overlap:50}") int overlap) {
        this.targetSize = targetSize;
        this.overlap = overlap;
    }

    public List<DocumentChunk> chunk(Long documentId, String cleanedText) {
        log.info("Starting smart chunking for document {}. Target size: {}, Overlap: {}",
                documentId, targetSize, overlap);

        List<DocumentChunk> chunks = new ArrayList<>();
        
        // 1. Split by paragraphs first (preserves heavy semantic boundaries)
        String[] paragraphs = cleanedText.split("\n\n");
        StringBuilder currentChunkContent = new StringBuilder();
        int currentSize = 0;
        int chunkIndex = 0;

        for (String paragraph : paragraphs) {
            String p = paragraph.trim();
            if (p.isEmpty()) continue;

            // Rough token estimate (words * 1.3 ≈ tokens)
            int pTokens = (int) (p.split("\\s+").length * 1.3);

            // If a single paragraph is larger than target size, split by sentences
            if (pTokens > targetSize) {
                // If we already have content, save it as a chunk first
                if (currentSize > 0) {
                    chunks.add(createChunk(documentId, chunkIndex++, currentChunkContent.toString(), currentSize));
                    currentChunkContent = new StringBuilder();
                    currentSize = 0;
                }
                
                String[] sentences = p.split("(?<=[.!?])\\s+");
                for (String sentence : sentences) {
                    int sTokens = (int) (sentence.split("\\s+").length * 1.3);
                    if (currentSize + sTokens > targetSize && currentSize > 0) {
                        chunks.add(createChunk(documentId, chunkIndex++, currentChunkContent.toString(), currentSize));
                        // Keep overlap
                        String lastPartOfChunk = getLastWords(currentChunkContent.toString(), overlap);
                        currentChunkContent = new StringBuilder(lastPartOfChunk).append(" ");
                        currentSize = (int) (lastPartOfChunk.split("\\s+").length * 1.3);
                    }
                    currentChunkContent.append(sentence).append(" ");
                    currentSize += sTokens;
                }
            } else {
                // Add paragraph to current chunk
                if (currentSize + pTokens > targetSize && currentSize > 0) {
                    chunks.add(createChunk(documentId, chunkIndex++, currentChunkContent.toString(), currentSize));
                    // Keep overlap across paragraphs
                    String lastPartOfChunk = getLastWords(currentChunkContent.toString(), overlap);
                    currentChunkContent = new StringBuilder(lastPartOfChunk).append("\n\n");
                    currentSize = (int) (lastPartOfChunk.split("\\s+").length * 1.3);
                }
                currentChunkContent.append(p).append("\n\n");
                currentSize += pTokens;
            }
        }

        // Add last chunk if remaining
        if (currentSize > 0) {
            chunks.add(createChunk(documentId, chunkIndex, currentChunkContent.toString().trim(), currentSize));
        }

        log.info("Chunking completed. Generated {} chunks.", chunks.size());
        return chunks;
    }

    private DocumentChunk createChunk(Long documentId, int index, String content, int estimatedTokens) {
        DocumentChunk chunk = new DocumentChunk();
        chunk.setDocumentId(documentId);
        chunk.setChunkIndex(index);
        chunk.setContent(content.trim());
        chunk.setTokenCount(estimatedTokens);
        chunk.setStatus(DocumentChunk.ChunkStatus.CLEANED);
        
        // Basic Metadata Tagging (Could be expanded using NLP)
        String metadata = String.format("{\"chunkIndex\": %d, \"estimatedTokens\": %d}", index, estimatedTokens);
        chunk.setMetadata(metadata);
        
        return chunk;
    }

    private String getLastWords(String text, int wordCount) {
        String[] words = text.split("\\s+");
        if (words.length <= wordCount) return text;
        
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - wordCount; i < words.length; i++) {
            sb.append(words[i]).append(" ");
        }
        return sb.toString().trim();
    }
}
