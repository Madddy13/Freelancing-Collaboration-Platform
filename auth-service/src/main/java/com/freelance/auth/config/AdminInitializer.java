package com.freelance.auth.config;

import com.freelance.auth.entity.Role;
import com.freelance.auth.entity.User;
import com.freelance.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        List<User> existingAdmins = userRepository.findByRole(Role.ROLE_ADMIN);

        boolean adminExists = false;

        for (User admin : existingAdmins) {
            String email = admin.getEmail() != null ? admin.getEmail().toLowerCase() : "";
            if ("madhavadmin@gmail.com".equals(email) || "madhavadmin".equals(email) || "madhavadmin@platform.com".equals(email)) {
                // Update and reset to requested email & name
                admin.setEmail("madhavadmin@gmail.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("madhav");
                admin.setLastName("admin");
                admin.setName("madhav admin");
                admin.setEmailVerified(true);
                admin.setStatus("ACTIVE");
                userRepository.save(admin);
                adminExists = true;
            } else {
                // Delete extra admin accounts so there is ONLY ONE admin in the system
                userRepository.delete(admin);
            }
        }

        if (!adminExists) {
            User admin = new User();
            admin.setFirstName("madhav");
            admin.setLastName("admin");
            admin.setName("madhav admin");
            admin.setEmail("madhavadmin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setEmailVerified(true);
            admin.setStatus("ACTIVE");
            userRepository.save(admin);
            System.out.println(">>> Single Hardcoded Admin Created: Name: madhav admin, Email: madhavadmin@gmail.com, Password: admin123 <<<");
        }
    }
}
