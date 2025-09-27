package com.tpl.tupalle.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    private boolean enabled = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(name = "title")
    private String title = "Newbie Coder";
 
    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expiry")
    private LocalDateTime resetPasswordExpiry;

}
