package com.tpl.tupalle.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpl.tupalle.entity.AuthProvider;
import com.tpl.tupalle.entity.DTO.AuthResponse;
import com.tpl.tupalle.entity.Role;
import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.repositories.AuthProviderRepository;
import com.tpl.tupalle.repositories.RoleRepository;
import com.tpl.tupalle.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthService.class);
    
    private final GoogleTokenService googleTokenService;
    private final AuthProviderRepository authProviderRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ObjectMapper objectMapper;
    
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;
    
    public GoogleAuthService(GoogleTokenService googleTokenService,
                           AuthProviderRepository authProviderRepository,
                           UserRepository userRepository,
                           RoleRepository roleRepository) {
        this.googleTokenService = googleTokenService;
        this.authProviderRepository = authProviderRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.objectMapper = new ObjectMapper();
    }
    
    @Transactional
    public AuthResponse processGoogleCallback(String code, String idToken, HttpServletRequest request) {
        try {
            // Step 1: Get ID token (either from code exchange or direct)
            String finalIdToken = idToken;
            if (finalIdToken == null && code != null) {
                logger.info("Exchanging authorization code for ID token");
                finalIdToken = googleTokenService.exchangeCodeForIdToken(code, redirectUri);
            }
            
            if (finalIdToken == null) {
                return new AuthResponse(null, "No valid token provided", false);
            }
            
            // Step 2: Validate and decode ID token
            logger.info("Validating Google ID token");
            var decodedJWT = googleTokenService.validateAndDecodeIdToken(finalIdToken);
            var profile = googleTokenService.extractProfile(decodedJWT);
            
            logger.info("Google profile extracted - sub: {}, email: {}, verified: {}", 
                       profile.sub, profile.email, profile.emailVerified);
            
            // Step 3: Look for existing auth provider
            Optional<AuthProvider> existingProvider = authProviderRepository
                    .findByProviderAndProviderId("google", profile.sub);
            
            AuthProvider authProvider;
            User user;
            
            if (existingProvider.isPresent()) {
                // Step 4a: Existing provider - update last login
                authProvider = existingProvider.get();
                authProvider.setLastLoginAt(LocalDateTime.now());
                authProviderRepository.save(authProvider);
                
                logger.info("Found existing auth provider for sub: {}", profile.sub);
                
                if (authProvider.getUserId() != null) {
                    // Provider is linked to a user
                    user = userRepository.findById(authProvider.getUserId())
                            .orElseThrow(() -> new RuntimeException("Linked user not found"));
                    logger.info("Using linked user: {}", user.getUsername());
                } else {
                    // Provider exists but not linked - try to link
                    user = attemptAccountLinking(authProvider, profile);
                }
            } else {
                // Step 4b: New provider - create auth provider record
                logger.info("Creating new auth provider for sub: {}", profile.sub);
                authProvider = createAuthProvider(profile, finalIdToken);
                
                // Step 5: Account linking logic
                user = attemptAccountLinking(authProvider, profile);
            }
            
            // Step 6: Create session
            createSession(request, user, authProvider);
            
            return new AuthResponse(user.getUsername(), "Google authentication successful", true);
            
        } catch (Exception e) {
            logger.error("Error processing Google callback", e);
            return new AuthResponse(null, "Authentication failed: " + e.getMessage(), false);
        }
    }
    
    private AuthProvider createAuthProvider(GoogleTokenService.GoogleProfile profile, String idToken) {
        AuthProvider authProvider = new AuthProvider();
        authProvider.setProvider("google");
        authProvider.setProviderId(profile.sub);
        authProvider.setProviderEmail(profile.email);
        authProvider.setEmailVerified(profile.emailVerified);
        authProvider.setDisplayName(profile.name);
        authProvider.setPictureUrl(profile.picture);
        authProvider.setLastLoginAt(LocalDateTime.now());
        
        // Store raw profile as JSON
        try {
            String rawProfile = objectMapper.writeValueAsString(Map.of(
                "sub", profile.sub,
                "email", profile.email,
                "email_verified", profile.emailVerified,
                "name", profile.name,
                "given_name", profile.givenName,
                "family_name", profile.familyName,
                "picture", profile.picture,
                "locale", profile.locale
            ));
            authProvider.setRawProfile(rawProfile);
        } catch (Exception e) {
            logger.warn("Failed to serialize raw profile", e);
            authProvider.setRawProfile("{}");
        }
        
        return authProviderRepository.save(authProvider);
    }
    
    private User attemptAccountLinking(AuthProvider authProvider, GoogleTokenService.GoogleProfile profile) {
        // Check if email is verified and exists in users table
        if (profile.emailVerified) {
            Optional<User> existingUser = userRepository.findByEmail(profile.email);
            if (existingUser.isPresent()) {
                // Auto-link to existing user
                User user = existingUser.get();
                authProvider.setUserId(user.getId());
                authProviderRepository.save(authProvider);
                
                logger.info("Auto-linked auth provider to existing user: {}", user.getUsername());
                return user;
            }
        }
        
        // No existing user to link to - create new user
        User newUser = createNewUser(profile);
        
        // Link auth provider to new user
        authProvider.setUserId(newUser.getId());
        authProviderRepository.save(authProvider);
        
        logger.info("Created new user and linked auth provider: {}", newUser.getUsername());
        return newUser;
    }
    
    private User createNewUser(GoogleTokenService.GoogleProfile profile) {
        User user = new User();
        user.setEmail(profile.email);
        user.setEmailVerified(profile.emailVerified);
        user.setEnabled(true);
        user.setTitle("Newbie Coder");
        user.setPasswordHash(""); // OAuth users don't need password
        
        // Generate unique username
        String baseUsername = profile.email.split("@")[0];
        String username = generateUniqueUsername(baseUsername);
        user.setUsername(username);
        
        // Assign USER role
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("USER role not found"));
        user.setRoles(new HashSet<>());
        user.getRoles().add(userRole);
        
        return userRepository.save(user);
    }
    
    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
    
    private void createSession(HttpServletRequest request, User user, AuthProvider authProvider) {
        HttpSession session = request.getSession(true);
        
        // Invalidate existing session for security
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
            session = request.getSession(true);
        }
        
        // Store user information in session
        session.setAttribute("username", user.getUsername());
        session.setAttribute("userId", user.getId());
        session.setAttribute("authProviderId", authProvider.getId());
        session.setAttribute("roles", user.getRoles().stream()
                .map(role -> role.getName())
                .toArray(String[]::new));
        
        logger.info("Session created for user: {} with auth provider: {}", 
                   user.getUsername(), authProvider.getId());
    }
}
