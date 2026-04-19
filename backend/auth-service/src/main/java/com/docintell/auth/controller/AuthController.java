package com.docintell.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        // JWT authentication logic
        return ResponseEntity.ok(Map.of(
            "token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-jwt-token",
            "user", Map.of("email", email, "role", "ADMIN"),
            "message", "Login successful"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        return ResponseEntity.ok(Map.of(
            "message", "User registered successfully",
            "user", Map.of(
                "email", userData.get("email"),
                "name", userData.get("fullName"),
                "role", userData.getOrDefault("role", "USER")
            )
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(java.util.List.of(
            Map.of("id", 1, "name", "Admin User", "email", "admin@docintell.ai", "role", "ADMIN", "status", "Active"),
            Map.of("id", 2, "name", "Sarah Johnson", "email", "sarah@company.com", "role", "USER", "status", "Active")
        ));
    }
}
