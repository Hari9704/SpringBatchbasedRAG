package com.docintell.batch.model;

import jakarta.persistence.*;

@Entity
@Table(name = "document_chunks")
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private int chunkIndex;

    @Lob
    @Column(nullable = false)
    private String content;

    @Lob
    private String metadata;  // JSON: {"page": 3, "section": "Risk Assessment", "heading": "3.2"}

    private int tokenCount;

    private String embeddingId;  // reference key for vector store lookup

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChunkStatus status = ChunkStatus.PENDING;

    public enum ChunkStatus { PENDING, CLEANED, EMBEDDED, FAILED }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public int getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(int chunkIndex) { this.chunkIndex = chunkIndex; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public int getTokenCount() { return tokenCount; }
    public void setTokenCount(int tokenCount) { this.tokenCount = tokenCount; }
    public String getEmbeddingId() { return embeddingId; }
    public void setEmbeddingId(String embeddingId) { this.embeddingId = embeddingId; }
    public ChunkStatus getStatus() { return status; }
    public void setStatus(ChunkStatus status) { this.status = status; }
}
