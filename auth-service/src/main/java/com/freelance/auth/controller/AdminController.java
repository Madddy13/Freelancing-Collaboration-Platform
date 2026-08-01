package com.freelance.auth.controller;

import com.freelance.auth.entity.User;
import com.freelance.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users (excluding admin)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() != com.freelance.auth.entity.Role.ROLE_ADMIN)
                .toList();
        return ResponseEntity.ok(users);
    }

    // Update user status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestParam String status) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(status);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            if (user.getRole() == com.freelance.auth.entity.Role.ROLE_ADMIN) {
                return ResponseEntity.badRequest().body("Admin users cannot be deleted.");
            }
            userRepository.delete(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
