package com.docintell.batch.repository;

import com.docintell.batch.model.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByDocumentIdOrderByChunkIndex(Long documentId);

    long countByDocumentId(Long documentId);

    List<DocumentChunk> findByDocumentIdAndStatus(Long documentId, DocumentChunk.ChunkStatus status);

    void deleteByDocumentId(Long documentId);
}
