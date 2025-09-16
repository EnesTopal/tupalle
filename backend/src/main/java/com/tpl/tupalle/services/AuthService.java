package com.tpl.tupalle.services;

import com.tpl.tupalle.entity.DTO.AuthResponse;
import com.tpl.tupalle.entity.DTO.LoginRequest;
import com.tpl.tupalle.entity.DTO.RegisterRequest;
import com.tpl.tupalle.entity.Role;
import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.repositories.RoleRepository;
import com.tpl.tupalle.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return new AuthResponse(null, "Username already exists", false);
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEnabled(true);

        // Assign USER role by default
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("USER role not found"));
        user.getRoles().add(userRole);

        userRepository.save(user);
        return new AuthResponse(user.getUsername(), "User registered successfully", true);
    }

    public boolean authenticate(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.username());
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return user.isEnabled() && passwordEncoder.matches(request.password(), user.getPasswordHash());
    }
}

