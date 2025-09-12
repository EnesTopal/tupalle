package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.AuthResponse;
import com.tpl.tupalle.entity.DTO.LoginRequest;
import com.tpl.tupalle.entity.DTO.RegisterRequest;
import com.tpl.tupalle.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Additional validation
        if (request.username().length() < 3) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Username must be at least 3 characters long", false));
        }
        if (request.username().length() > 50) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Username must be less than 50 characters", false));
        }
        if (request.password().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Password must be at least 6 characters long", false));
        }
        if (request.password().length() > 100) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Password must be less than 100 characters", false));
        }
        
        AuthResponse response = authService.register(request);
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        if (authService.authenticate(request)) {
            // Create session
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("username", request.username());
            
            return ResponseEntity.ok(new AuthResponse(request.username(), "Login successful", true));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Invalid username or password", false));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(new AuthResponse(null, "Logout successful", true));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok(new AuthResponse(authentication.getName(), "User authenticated", true));
        } else {
            return ResponseEntity.ok(new AuthResponse(null, "Not authenticated", false));
        }
    }
}

