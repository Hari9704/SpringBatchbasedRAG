package com.docintell.document.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;

    private String type;
    private Long sizeBytes;
    private int version = 1;
    private int chunks = 0;

    @Column(length = 512)
    private String storagePath;

    @Column(length = 64)
    private String contentHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.UPLOADED;

    @Column(nullable = false)
    private LocalDateTime uploadDate = LocalDateTime.now();

    private LocalDateTime processedDate;

    @Lob
    private String rawContent;

    public enum Status { UPLOADED, VALIDATING, EXTRACTING, CLEANING, CHUNKING, EMBEDDING, PROCESSED, FAILED }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public int getChunks() { return chunks; }
    public void setChunks(int chunks) { this.chunks = chunks; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }
    public String getContentHash() { return contentHash; }
    public void setContentHash(String contentHash) { this.contentHash = contentHash; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
    public LocalDateTime getProcessedDate() { return processedDate; }
    public void setProcessedDate(LocalDateTime processedDate) { this.processedDate = processedDate; }
    public String getRawContent() { return rawContent; }
    public void setRawContent(String rawContent) { this.rawContent = rawContent; }
}
