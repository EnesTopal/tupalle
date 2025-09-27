package com.tpl.tupalle.entity.DTO;

import jakarta.validation.constraints.NotBlank;

public record GoogleCallbackRequest(
    @NotBlank(message = "Code or ID token is required")
    String code, // Authorization code from Google
    
    String idToken // Direct ID token (alternative to code)
) {
    // Constructor validation
    public GoogleCallbackRequest {
        if ((code == null || code.trim().isEmpty()) && 
            (idToken == null || idToken.trim().isEmpty())) {
            throw new IllegalArgumentException("Either code or idToken must be provided");
        }
    }
}
