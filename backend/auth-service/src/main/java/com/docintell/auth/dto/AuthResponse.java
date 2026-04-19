package com.docintell.auth.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String fullName;
    private String role;
    private String message;

    private AuthResponse() {}

    public static AuthResponse success(String token, String email, String fullName, String role) {
        AuthResponse r = new AuthResponse();
        r.token = token;
        r.email = email;
        r.fullName = fullName;
        r.role = role;
        r.message = "Authentication successful";
        return r;
    }

    public static AuthResponse registered(String email, String fullName, String role) {
        AuthResponse r = new AuthResponse();
        r.email = email;
        r.fullName = fullName;
        r.role = role;
        r.message = "User registered successfully";
        return r;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public String getMessage() { return message; }
}
