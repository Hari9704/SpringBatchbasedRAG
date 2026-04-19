package com.docintell.document.repository;

import com.docintell.document.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserIdOrderByUploadDateDesc(Long userId);

    List<Document> findByStatus(Document.Status status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, Document.Status status);
}
