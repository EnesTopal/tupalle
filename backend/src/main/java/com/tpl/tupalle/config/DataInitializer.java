package com.tpl.tupalle.config;

import com.tpl.tupalle.entity.Role;
import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.repositories.RoleRepository;
import com.tpl.tupalle.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeTestUsers();
    }

    private void initializeRoles() {
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            userRole.setDescription("Regular user");
            roleRepository.save(userRole);
        }

        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            adminRole.setDescription("Administrator");
            roleRepository.save(adminRole);
        }
    }

    private void initializeTestUsers() {
        // Create admin user
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setEnabled(true);
            
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
        }

        // Create test user
        if (userRepository.findByUsername("testuser").isEmpty()) {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setPasswordHash(passwordEncoder.encode("test123"));
            testUser.setEnabled(true);
            
            Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
            testUser.setRoles(Set.of(userRole));
            userRepository.save(testUser);
        }
    }
}

