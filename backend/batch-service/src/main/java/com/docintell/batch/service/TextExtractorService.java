package com.docintell.batch.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Extracts raw text from uploaded documents.
 * Supports PDF (via Apache PDFBox) and DOCX (via Apache POI).
 */
@Service
public class TextExtractorService {

    private static final Logger log = LoggerFactory.getLogger(TextExtractorService.class);

    public String extract(String filePath, String fileType) throws IOException {
        String normalizedType = fileType;
        if (normalizedType == null || normalizedType.isBlank()) {
            String name = Path.of(filePath).getFileName().toString();
            int dot = name.lastIndexOf('.');
            normalizedType = dot >= 0 ? name.substring(dot + 1) : "TXT";
            log.warn("Missing file type; inferred {} from path", normalizedType);
        }

        log.info("Extracting text from {} (type: {})", filePath, normalizedType);

        return switch (normalizedType.toUpperCase()) {
            case "PDF" -> extractFromPdf(filePath);
            case "DOCX" -> extractFromDocx(filePath);
            case "TXT" -> extractFromTxt(filePath);
            default -> throw new IllegalArgumentException("Unsupported file type: " + fileType);
        };
    }

    private String extractFromPdf(String filePath) throws IOException {
        try (PDDocument document = Loader.loadPDF(Path.of(filePath).toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.info("PDF extraction complete: {} pages, {} characters", document.getNumberOfPages(), text.length());
            return text;
        }
    }

    private String extractFromDocx(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             XWPFDocument document = new XWPFDocument(fis)) {

            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText();
                if (text != null && !text.isBlank()) {
                    sb.append(text).append("\n");
                }
            }
            log.info("DOCX extraction complete: {} characters", sb.length());
            return sb.toString();
        }
    }

    private String extractFromTxt(String filePath) throws IOException {
        String text = Files.readString(Path.of(filePath));
        log.info("TXT extraction complete: {} characters", text.length());
        return text;
    }
}
