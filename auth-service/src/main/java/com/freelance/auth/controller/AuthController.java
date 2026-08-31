package com.freelance.auth.controller;

import com.freelance.auth.dto.AuthResponse;
import com.freelance.auth.dto.LoginRequest;
import com.freelance.auth.dto.RegisterRequest;
import com.freelance.auth.entity.PasswordResetToken;
import com.freelance.auth.entity.User;
import com.freelance.auth.repository.PasswordResetTokenRepository;
import com.freelance.auth.repository.UserRepository;
import com.freelance.auth.service.AuthService;
import com.freelance.auth.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          PasswordResetTokenRepository resetTokenRepository,
                          PasswordEncoder passwordEncoder,
                          EmailService emailService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // ── REGISTER ──
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // ── LOGIN ──
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ── VERIFY EMAIL ──
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification token."));
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now access all feature workflows."));
    }

    // ── FORGOT PASSWORD ──
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);

        if (user == null) {
            return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been dispatched."));
        }

        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setTokenExpiry(LocalDateTime.now().plusHours(2));
        userRepository.save(user);

        // Save legacy token entity as fallback
        try {
            PasswordResetToken legacyToken = new PasswordResetToken(user.getId());
            resetTokenRepository.save(legacyToken);
        } catch (Exception ignored) {}

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            System.err.println("Email send warning: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Password reset email sent successfully."));
    }

    // ── RESET PASSWORD ──
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String tokenStr = body.get("token");
        String newPassword = body.get("newPassword");

        if (tokenStr == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required."));
        }

        User user = userRepository.findByResetPasswordToken(tokenStr).orElse(null);

        if (user == null && resetTokenRepository != null) {
            PasswordResetToken legacyToken = resetTokenRepository.findByToken(tokenStr).orElse(null);
            if (legacyToken != null && !legacyToken.isUsed() && !legacyToken.isExpired()) {
                user = userRepository.findById(legacyToken.getUserId()).orElse(null);
                legacyToken.setUsed(true);
                resetTokenRepository.save(legacyToken);
            }
        }

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password reset token is invalid or has expired."));
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        user.setResetPasswordToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in with your new password."));
    }
}