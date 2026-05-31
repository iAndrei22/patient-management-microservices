package com.pm.authservice.dto;

public class RegisterResponseDTO {
    private final String message;

    public RegisterResponseDTO(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}

