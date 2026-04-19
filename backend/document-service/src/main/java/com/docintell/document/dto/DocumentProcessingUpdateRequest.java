package com.docintell.document.dto;

import com.docintell.document.model.Document;

import java.time.LocalDateTime;

public class DocumentProcessingUpdateRequest {

    private Document.Status status;
    private Integer chunks;
    private LocalDateTime processedDate;

    public Document.Status getStatus() {
        return status;
    }

    public void setStatus(Document.Status status) {
        this.status = status;
    }

    public Integer getChunks() {
        return chunks;
    }

    public void setChunks(Integer chunks) {
        this.chunks = chunks;
    }

    public LocalDateTime getProcessedDate() {
        return processedDate;
    }

    public void setProcessedDate(LocalDateTime processedDate) {
        this.processedDate = processedDate;
    }
}
