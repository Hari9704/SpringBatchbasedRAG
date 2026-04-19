package com.docintell.feedback.service;

import com.docintell.feedback.model.Feedback;
import com.docintell.feedback.repository.FeedbackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private static final Logger log = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback saveFeedback(Feedback feedback) {
        log.info("Saving feedback for Query {}: {}", feedback.getQueryId(), feedback.getAction());
        
        Feedback saved = feedbackRepository.save(feedback);
        
        if (saved.getAction() == Feedback.FeedbackAction.REJECTED || saved.getAction() == Feedback.FeedbackAction.EDITED) {
            triggerReprocessingOrLogging(saved);
        }
        
        return saved;
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAllByOrderByTimestampDesc();
    }

    private void triggerReprocessingOrLogging(Feedback feedback) {
        log.warn("Negative feedback registered. Flagging for continuous evaluation pipeline.");
        // In a microservices architecture, you might emit a Kafka event here:
        // kafkaTemplate.send("docintell.feedback.negative", feedback);
    }
}
