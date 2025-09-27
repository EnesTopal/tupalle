package com.tpl.tupalle.services;

import com.tpl.tupalle.entity.DTO.*;
import com.tpl.tupalle.entity.Role;
import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.repositories.RoleRepository;
import com.tpl.tupalle.repositories.UserRepository;
import com.tpl.tupalle.repositories.ShareRepository;
import com.tpl.tupalle.repositories.ShareLikeRepository;
import com.tpl.tupalle.repositories.AuthProviderRepository;
import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.entity.AuthProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ShareRepository shareRepository;
    private final ShareLikeRepository shareLikeRepository;
    private final AuthProviderRepository authProviderRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
            ShareRepository shareRepository, ShareLikeRepository shareLikeRepository,
            AuthProviderRepository authProviderRepository, PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.shareRepository = shareRepository;
        this.shareLikeRepository = shareLikeRepository;
        this.authProviderRepository = authProviderRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return new AuthResponse(null, "Username already exists", false);
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            return new AuthResponse(null, "Email already exists", false);
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        user.setEmailVerified(false);
        user.setTitle("Newbie Coder");
        user.setVerificationToken(UUID.randomUUID().toString());

        // Assign USER role by default
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("USER role not found"));
        user.getRoles().add(userRole);

        userRepository.save(user);

        // Send verification email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), user.getVerificationToken());

        return new AuthResponse(user.getUsername(),
                "User registered successfully. Please check your email for verification.", true);
    }

    public boolean authenticate(LoginRequest request) {
        // Try to find user by username first, then by email
        Optional<User> userOpt = userRepository.findByUsername(request.usernameOrEmail());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.usernameOrEmail());
        }

        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return user.isEnabled() && passwordEncoder.matches(request.password(), user.getPasswordHash());
    }

    @Transactional
    public AuthResponse verifyEmail(EmailVerificationRequest request) {
        Optional<User> userOpt = userRepository.findByVerificationToken(request.token());
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, "Invalid verification token", false);
        }

        User user = userOpt.get();
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return new AuthResponse(user.getUsername(), "Email verified successfully", true);
    }

    @Transactional
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not for security
            return new AuthResponse(null, "If the email exists, a password reset link has been sent", true);
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Send password reset email asynchronously
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetToken);

        return new AuthResponse(null, "If the email exists, a password reset link has been sent", true);
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByResetPasswordToken(request.token());
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, "Invalid reset token", false);
        }

        User user = userOpt.get();
        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            return new AuthResponse(null, "Reset token has expired", false);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);

        return new AuthResponse(user.getUsername(), "Password reset successfully", true);
    }

    @Transactional
    public AuthResponse resendVerificationEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, "Email not found", false);
        }

        User user = userOpt.get();
        if (user.getEmailVerified()) {
            return new AuthResponse(null, "Email is already verified", false);
        }

        // Generate new verification token
        user.setVerificationToken(UUID.randomUUID().toString());
        userRepository.save(user);

        // Send verification email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), user.getVerificationToken());

        return new AuthResponse(null, "Verification email sent", true);
    }

    @Transactional
    public AuthResponse selectUsername(UsernameSelectionRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return new AuthResponse(null, "Username already exists", false);
        }

        // Find user with temp username (Google OAuth users)
        Optional<User> userOpt = userRepository.findByUsername("temp_" + request.username());
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, "No pending username selection found", false);
        }

        User user = userOpt.get();
        user.setUsername(request.username());
        userRepository.save(user);

        return new AuthResponse(user.getUsername(), "Username selected successfully", true);
    }

    @Transactional
    public AuthResponse changeUsername(UsernameSelectionRequest request, String currentUsername) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return new AuthResponse(null, "Username already exists", false);
        }

        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, "User not found", false);
        }

        User user = userOpt.get();
        user.setUsername(request.username());
        userRepository.save(user);

        return new AuthResponse(user.getUsername(), "Username changed successfully", true);
    }

    @Transactional
    public AuthResponse deleteAccount(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, "User not found", false);
        }

        User user = userOpt.get();
        Long userId = user.getId();

        try {

            List<Share> likedShares = shareLikeRepository.findLikedSharesByUserIdExcludingOwnShares(userId,
                    Pageable.unpaged()).getContent();

            for (Share share : likedShares) {
                share.setLikeCount(share.getLikeCount() - 1);
                shareRepository.save(share);
            }

            shareLikeRepository.deleteByUserId(userId);

            List<Share> userShares = shareRepository.findByOwnerUsername(username);
            for (Share share : userShares) {
                shareLikeRepository.deleteByShareId(share.getId());
                shareRepository.delete(share);
            }

            List<AuthProvider> authProviders = authProviderRepository.findByUserId(userId);
            for (AuthProvider authProvider : authProviders) {
                authProviderRepository.delete(authProvider);
            }

            user.getRoles().clear();

            userRepository.delete(user);

            return new AuthResponse(null, "Account deleted successfully", true);
        } catch (Exception e) {
            log.error("Error deleting account for user {}: {}", username, e.getMessage());
            return new AuthResponse(null, "Failed to delete account. Please try again.", false);
        }
    }

}
