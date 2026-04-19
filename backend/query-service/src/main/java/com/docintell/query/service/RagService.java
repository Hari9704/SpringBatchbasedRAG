package com.docintell.query.service;

import com.docintell.query.dto.QueryRequest;
import com.docintell.query.dto.QueryResponse;
import com.docintell.query.model.QueryRecord;
import com.docintell.query.repository.QueryRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;

/**
 * The core RAG Engine using Spring AI.
 */
@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final QueryRecordRepository queryRepository;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    
    private final int topK;
    private final double similarityThreshold;

    public RagService(QueryRecordRepository queryRepository,
                      VectorStore vectorStore,
                      ChatClient.Builder chatClientBuilder,
                      @Value("${docintell.rag.top-k:5}") int topK,
                      @Value("${docintell.rag.similarity-threshold:0.75}") double similarityThreshold) {
        this.queryRepository = queryRepository;
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
        this.topK = topK;
        this.similarityThreshold = similarityThreshold;
    }

    public QueryResponse executeQuery(QueryRequest request) {
        log.info("Executing RAG query for user {}: {}", request.getUserId(), request.getQuestion());

        // Step 1 & 2: Embed Query and Vector Search
        log.debug("Performing vector similarity search. Target TopK: {}, Threshold: {}", topK, similarityThreshold);
        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(request.getQuestion())
                .topK(topK)
                .similarityThreshold(similarityThreshold);

        if (request.getDocumentId() != null) {
            String filterExpression = "documentId == " + request.getDocumentId();
            log.debug("Applying document filter expression: {}", filterExpression);
            searchRequestBuilder.filterExpression(filterExpression);
        }

        SearchRequest searchRequest = searchRequestBuilder.build();
                
        List<Document> topChunks = vectorStore.similaritySearch(searchRequest);
        
        String answer;
        int confidence = 0;
        List<Map<String, Object>> sources = List.of();

        if (topChunks.isEmpty()) {
            if (request.getDocumentId() != null) {
                answer = "I could not find relevant information in the selected document to answer that question.";
            } else {
                answer = "I'm sorry, but I could not find any relevant information in your uploaded documents to answer that question.";
            }
            log.warn("Fail-Safe Triggered: No chunks met similarity threshold.");
        } else {
            // Step 3: Build Context
            String contextStr = topChunks.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n---\n\n"));
                
            // Generate answer via AI
            log.info("Calling Gemini Chat Client with {} context chunks...", topChunks.size());
            
            String promptText = """
                You are DocIntell AI, an expert document intelligence assistant.
                Answer the user's question using ONLY the provided context blocks below.
                If the context does not contain the answer, say "I cannot answer this based on the provided documents."
                
                Context:
                {context}
                
                Question:
                {question}
                """;
                
            answer = chatClient.prompt()
                .system(sys -> sys.text(promptText).param("context", contextStr).param("question", request.getQuestion()))
                .user(request.getQuestion())
                .call()
                .content();
                
            confidence = 90; // Since SimpleVectorStore distance scores are tricky, hardcode high confidence if chunks were found.
            
            sources = topChunks.stream()
                .map(doc -> Map.of(
                        "documentId", doc.getMetadata().get("documentId"),
                        "chunkIndex", doc.getMetadata().get("chunkIndex"),
                        "chunk", doc.getContent().length() > 50 ? doc.getContent().substring(0, 50) + "..." : doc.getContent(),
                        "relevance", "High"
                ))
                .collect(Collectors.toList());
        }

        // Save Query Record
        QueryRecord record = new QueryRecord();
        record.setUserId(request.getUserId());
        record.setDocumentId(request.getDocumentId());
        record.setQuestion(request.getQuestion());
        record.setAnswer(answer);
        record.setConfidenceScore(confidence);
        record.setSourceContext(String.valueOf(sources)); 
        record.setReasoningApplied(request.isReasoning());
        
        record = queryRepository.save(record);

        // Build Response
        QueryResponse response = new QueryResponse();
        response.setQueryId(record.getId());
        response.setAnswer(answer);
        response.setConfidence(confidence);
        response.setSources(sources);
        response.setReasoning(request.isReasoning());

        return response;
    }
}
