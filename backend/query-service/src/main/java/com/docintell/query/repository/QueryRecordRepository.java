package com.docintell.query.repository;

import com.docintell.query.model.QueryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueryRecordRepository extends JpaRepository<QueryRecord, Long> {

    List<QueryRecord> findByUserIdOrderByTimestampDesc(Long userId);

    long countByUserId(Long userId);
}
