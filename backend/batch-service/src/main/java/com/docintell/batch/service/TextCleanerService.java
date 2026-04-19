package com.docintell.batch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/**
 * Pre-RAG text cleaning and normalization.
 * Ensures embeddings are generated from clean, consistent text.
 */
@Service
public class TextCleanerService {

    private static final Logger log = LoggerFactory.getLogger(TextCleanerService.class);

    // Patterns compiled once for reuse
    private static final Pattern MULTIPLE_SPACES = Pattern.compile(" {2,}");
    private static final Pattern MULTIPLE_NEWLINES = Pattern.compile("\n{3,}");
    private static final Pattern PAGE_NUMBERS = Pattern.compile("(?m)^\\s*-?\\s*\\d{1,4}\\s*-?\\s*$");
    private static final Pattern HEADER_FOOTER = Pattern.compile("(?m)^(Page \\d+( of \\d+)?|\\d+/\\d+|©.*|Confidential.*|DRAFT.*)$");
    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]");
    private static final Pattern BULLET_NORMALIZE = Pattern.compile("[•●○▪▸►]");

    public String clean(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }

        int originalLength = rawText.length();

        String cleaned = rawText;

        // Step 1: Remove control characters
        cleaned = CONTROL_CHARS.matcher(cleaned).replaceAll("");

        // Step 2: Normalize unicode
        cleaned = java.text.Normalizer.normalize(cleaned, java.text.Normalizer.Form.NFKC);

        // Step 3: Strip page numbers
        cleaned = PAGE_NUMBERS.matcher(cleaned).replaceAll("");

        // Step 4: Remove common headers/footers
        cleaned = HEADER_FOOTER.matcher(cleaned).replaceAll("");

        // Step 5: Normalize bullet points
        cleaned = BULLET_NORMALIZE.matcher(cleaned).replaceAll("-");

        // Step 6: Collapse whitespace
        cleaned = MULTIPLE_SPACES.matcher(cleaned).replaceAll(" ");
        cleaned = MULTIPLE_NEWLINES.matcher(cleaned).replaceAll("\n\n");

        // Step 7: Trim lines
        String[] lines = cleaned.split("\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                sb.append(trimmed).append("\n");
            }
        }
        cleaned = sb.toString().trim();

        log.info("Text cleaned: {} → {} characters (removed {}%)",
                originalLength, cleaned.length(),
                originalLength > 0 ? (100 - (cleaned.length() * 100 / originalLength)) : 0);

        return cleaned;
    }

    /**
     * Removes exact duplicate paragraphs (common in PDF extraction).
     */
    public String deduplicateParagraphs(String text) {
        String[] paragraphs = text.split("\n\n");
        java.util.LinkedHashSet<String> unique = new java.util.LinkedHashSet<>();
        for (String p : paragraphs) {
            if (!p.isBlank()) {
                unique.add(p.trim());
            }
        }
        int removed = paragraphs.length - unique.size();
        if (removed > 0) {
            log.info("Removed {} duplicate paragraphs", removed);
        }
        return String.join("\n\n", unique);
    }
}
