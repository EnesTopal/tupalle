package com.tpl.tupalle.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "auth_providers")
@Data
public class AuthProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider; // 'google', 'facebook', etc.

    @Column(name = "provider_id", nullable = false)
    private String providerId; // 'sub' from OAuth provider

    @Column(name = "provider_email", nullable = false)
    private String providerEmail;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "raw_profile", columnDefinition = "TEXT")
    private String rawProfile; // JSON string of full profile

    @Column(name = "user_id")
    private Long userId; // FK to users table, nullable

    @Column(name = "app_refresh_token_id")
    private String appRefreshTokenId; // Placeholder for future JWT refresh tokens

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // Relationship to User entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
