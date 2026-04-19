package com.docintell.document.service;

import com.docintell.document.model.Document;
import com.docintell.document.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final Path uploadDir;
    private final long maxFileSize;
    private final List<String> allowedTypes;

    public DocumentService(
            DocumentRepository documentRepository,
            @Value("${docintell.upload.storage-path:./data/uploads}") String storagePath,
            @Value("${docintell.upload.max-file-size:52428800}") long maxFileSize,
            @Value("${docintell.upload.allowed-types:pdf,docx,txt}") String allowedTypes) {
        this.documentRepository = documentRepository;
        this.uploadDir = Paths.get(storagePath);
        this.maxFileSize = maxFileSize;
        this.allowedTypes = Arrays.stream(allowedTypes.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public Document upload(MultipartFile file, Long userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File exceeds maximum size of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String originalName = file.getOriginalFilename();
        String extension = extractExtension(originalName).toLowerCase();
        if (!allowedTypes.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file type: " + extension + ". Allowed: " + allowedTypes);
        }

        // Ensure upload directory exists
        Files.createDirectories(uploadDir);

        // Generate unique storage path
        String storedFileName = System.currentTimeMillis() + "_" + originalName;
        Path filePath = uploadDir.resolve(storedFileName);
        Files.copy(file.getInputStream(), filePath);

        // Compute content hash for deduplication
        String contentHash = computeHash(file.getBytes());

        // Persist metadata
        Document doc = new Document();
        doc.setUserId(userId);
        doc.setName(originalName);
        doc.setType(extension.toUpperCase());
        doc.setSizeBytes(file.getSize());
        doc.setStoragePath(filePath.toString());
        doc.setContentHash(contentHash);
        doc.setStatus(Document.Status.UPLOADED);

        return documentRepository.save(doc);
    }

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadDateDesc(userId);
    }

    public Document getById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
    }

    public Document updateProcessingState(Long id, Document.Status status, Integer chunks, LocalDateTime processedDate) {
        Document document = getById(id);

        document.setStatus(status);
        if (chunks != null) {
            document.setChunks(chunks);
        }

        if (processedDate != null) {
            document.setProcessedDate(processedDate);
        } else if (status == Document.Status.PROCESSED) {
            document.setProcessedDate(LocalDateTime.now());
        } else if (status != Document.Status.PROCESSED) {
            document.setProcessedDate(null);
        }

        return documentRepository.save(document);
    }

    public void deleteDocument(Long id, Long userId) {
        Document doc = getById(id);
        if (!doc.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        // Delete physical file
        try {
            Files.deleteIfExists(Path.of(doc.getStoragePath()));
        } catch (IOException e) {
            // Log but don't fail — metadata cleanup is more important
        }
        documentRepository.delete(doc);
    }

    public long countByUser(Long userId) {
        return documentRepository.countByUserId(userId);
    }

    public long countProcessedByUser(Long userId) {
        return documentRepository.countByUserIdAndStatus(userId, Document.Status.PROCESSED);
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private String computeHash(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
