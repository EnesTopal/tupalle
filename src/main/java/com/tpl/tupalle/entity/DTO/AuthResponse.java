package com.tpl.tupalle.entity.DTO;

public record AuthResponse(
        String username,
        String message,
        boolean success
) {}

