package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.*;
import com.tpl.tupalle.services.AuthService;
import com.tpl.tupalle.services.GoogleAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.register(request);
        if (response.success()) {
            // Create session for newly registered user
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("username", request.username());
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
            session.setAttribute("username", request.usernameOrEmail());

            return ResponseEntity.ok(new AuthResponse(request.usernameOrEmail(), "Login successful", true));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Invalid username/email or password", false));
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

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        AuthResponse response = authService.verifyEmail(request);
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmailGet(@RequestParam String token, HttpServletRequest request) {
        EmailVerificationRequest emailRequest = new EmailVerificationRequest(token);
        AuthResponse response = authService.verifyEmail(emailRequest);

        if (response.success()) {
            // Create session for verified user
            HttpSession session = request.getSession(true);
            session.setAttribute("username", response.username());

            // Redirect to frontend with success message
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", "http://localhost:3000?verified=true&message=" +
                            URLEncoder.encode(response.message(), StandardCharsets.UTF_8))
                    .build();
        } else {
            // Redirect to frontend with error message
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", "http://localhost:3000?verified=false&message=" +
                            URLEncoder.encode(response.message(), StandardCharsets.UTF_8))
                    .build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        AuthResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        AuthResponse response = authService.resetPassword(request);
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPasswordGet(@RequestParam String token, HttpServletRequest request) {
        // Redirect to frontend reset password page with token
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:3000/reset-password?token=" +
                        URLEncoder.encode(token, StandardCharsets.UTF_8))
                .build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<AuthResponse> resendVerificationEmail(@RequestParam String email) {
        AuthResponse response = authService.resendVerificationEmail(email);
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/google/callback")
    public ResponseEntity<AuthResponse> googleCallback(@Valid @RequestBody GoogleCallbackRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = googleAuthService.processGoogleCallback(
                request.code(),
                request.idToken(),
                httpRequest);

        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/change-username")
    public ResponseEntity<AuthResponse> changeUsername(@Valid @RequestBody UsernameSelectionRequest request,
            Authentication authentication) {
        AuthResponse response = authService.changeUsername(request, authentication.getName());
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<AuthResponse> deleteAccount(Authentication authentication,
            HttpServletRequest request) {
        AuthResponse response = authService.deleteAccount(authentication.getName());
        if (response.success()) {
            // Invalidate session
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

}
