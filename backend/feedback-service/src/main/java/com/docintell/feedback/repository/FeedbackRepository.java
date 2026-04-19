package com.docintell.feedback.repository;

import com.docintell.feedback.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Usually we would link to a userId, assuming it's added to Feedback later
    List<Feedback> findAllByOrderByTimestampDesc();

    long countByAction(Feedback.FeedbackAction action);
}
