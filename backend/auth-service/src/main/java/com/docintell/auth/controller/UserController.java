package com.docintell.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(Map.of(
            "id", 1,
            "name", "Syama Prasad",
            "email", "syama@docintell.ai",
            "role", "Admin",
            "department", "AI Engineering",
            "phone", "+91 98765 43210",
            "bio", "Senior platform engineer specializing in RAG pipelines and intelligent document processing.",
            "joined", "March 2026",
            "avatar", "SP"
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData) {
        return ResponseEntity.ok(Map.of(
            "message", "Profile updated successfully",
            "name", profileData.getOrDefault("name", ""),
            "email", profileData.getOrDefault("email", ""),
            "department", profileData.getOrDefault("department", ""),
            "phone", profileData.getOrDefault("phone", ""),
            "bio", profileData.getOrDefault("bio", "")
        ));
    }

    @GetMapping("/activity")
    public ResponseEntity<?> getActivity() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "action", "Queried", "target", "Q3 Financial Report", "time", "2 min ago"),
            Map.of("id", 2, "action", "Uploaded", "target", "SLA_Agreement_2026.pdf", "time", "15 min ago"),
            Map.of("id", 3, "action", "Reviewed", "target", "Compliance Guidelines v2", "time", "1 hr ago"),
            Map.of("id", 4, "action", "Queried", "target", "Risk Assessment Q2", "time", "3 hr ago"),
            Map.of("id", 5, "action", "Edited feedback", "target", "Vendor Contract Batch", "time", "5 hr ago")
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        return ResponseEntity.ok(Map.of(
            "documentsUploaded", 47,
            "aiQueries", 128,
            "feedbackGiven", 34,
            "feedbackAcceptRate", 92,
            "activeSessions", 2
        ));
    }

    @PutMapping("/notifications")
    public ResponseEntity<?> updateNotifications(@RequestBody Map<String, Boolean> prefs) {
        return ResponseEntity.ok(Map.of(
            "message", "Notification preferences updated",
            "preferences", prefs
        ));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwords) {
        return ResponseEntity.ok(Map.of(
            "message", "Password changed successfully"
        ));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions() {
        return ResponseEntity.ok(List.of(
            Map.of("device", "Windows Desktop — Chrome", "ip", "192.168.1.10", "time", "Now", "current", true),
            Map.of("device", "Android Phone — Mobile App", "ip", "192.168.1.22", "time", "3 hr ago", "current", false)
        ));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> revokeSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(Map.of(
            "message", "Session revoked successfully",
            "sessionId", sessionId
        ));
    }
}
