package com.docintell.batch.repository;

import com.docintell.batch.model.BatchJobRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchJobRecordRepository extends JpaRepository<BatchJobRecord, Long> {

    List<BatchJobRecord> findAllByOrderByStartTimeDesc();

    List<BatchJobRecord> findByDocumentId(Long documentId);
}
