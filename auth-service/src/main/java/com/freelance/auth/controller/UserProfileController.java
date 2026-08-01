package com.freelance.auth.controller;

import com.freelance.auth.entity.Certification;
import com.freelance.auth.entity.User;
import com.freelance.auth.repository.CertificationRepository;
import com.freelance.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserRepository userRepository;
    private final CertificationRepository certificationRepository;

    @Value("${app.upload.dir:uploads/avatars}")
    private String uploadDir;

    public UserProfileController(UserRepository userRepository,
                                 CertificationRepository certificationRepository) {
        this.userRepository = userRepository;
        this.certificationRepository = certificationRepository;
    }

    // ── GET profile by userId ──
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── UPDATE profile fields ──
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId,
                                           @RequestBody Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName"))   user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName"))    user.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("name"))        user.setName((String) updates.get("name"));
        if (updates.containsKey("bio"))          user.setBio((String) updates.get("bio"));
        if (updates.containsKey("skills"))       user.setSkills((String) updates.get("skills"));
        if (updates.containsKey("portfolioUrl")) user.setPortfolioUrl((String) updates.get("portfolioUrl"));
        if (updates.containsKey("companyName"))  user.setCompanyName((String) updates.get("companyName"));
        if (updates.containsKey("industry"))     user.setIndustry((String) updates.get("industry"));
        if (updates.containsKey("website"))      user.setWebsite((String) updates.get("website"));
        if (updates.containsKey("hourlyRate")) {
            Object rate = updates.get("hourlyRate");
            if (rate != null && !rate.toString().trim().isEmpty()) {
                try {
                    user.setHourlyRate(Double.parseDouble(rate.toString()));
                } catch (NumberFormatException ignored) {}
            }
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // ── UPLOAD avatar ──
    @PostMapping("/avatar/{userId}")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long userId,
                                          @RequestParam("file") MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String origName = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_") : "avatar.png";
            String fileName = userId + "_" + System.currentTimeMillis() + "_" + origName;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String avatarUrl = "/uploads/avatars/" + fileName;
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload avatar.");
        }
    }

    // ── UPLOAD certification PDF document ──
    @PostMapping("/certifications/upload")
    public ResponseEntity<?> uploadCertificationPdf(@RequestParam("file") MultipartFile file) {
        try {
            String certDir = "uploads/certifications";
            Path uploadPath = Paths.get(certDir);
            Files.createDirectories(uploadPath);

            String origName = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_") : "cert.pdf";
            String fileName = "cert_" + System.currentTimeMillis() + "_" + origName;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String pdfUrl = "/uploads/certifications/" + fileName;
            return ResponseEntity.ok(Map.of("pdfUrl", pdfUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload certification document.");
        }
    }

    // ── GET certifications ──
    @GetMapping("/certifications/{userId}")
    public ResponseEntity<?> getCertifications(@PathVariable Long userId) {
        return ResponseEntity.ok(certificationRepository.findByUserId(userId));
    }

    // ── ADD certification ──
    @PostMapping("/certifications/{userId}")
    public ResponseEntity<?> addCertification(@PathVariable Long userId,
                                               @RequestBody Certification cert) {
        cert.setUserId(userId);
        return ResponseEntity.ok(certificationRepository.save(cert));
    }

    // ── UPDATE certification ──
    @PutMapping("/certifications/{certId}")
    public ResponseEntity<?> updateCertification(@PathVariable Long certId,
                                                  @RequestBody Certification updated) {
        Certification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
        cert.setTitle(updated.getTitle());
        cert.setOrganization(updated.getOrganization());
        cert.setIssueDate(updated.getIssueDate());
        cert.setCredentialId(updated.getCredentialId());
        cert.setCredentialUrl(updated.getCredentialUrl());
        if (updated.getCertificatePdfUrl() != null) {
            cert.setCertificatePdfUrl(updated.getCertificatePdfUrl());
        }
        return ResponseEntity.ok(certificationRepository.save(cert));
    }

    // ── DELETE certification ──
    @DeleteMapping("/certifications/{certId}")
    public ResponseEntity<?> deleteCertification(@PathVariable Long certId) {
        certificationRepository.deleteById(certId);
        return ResponseEntity.ok(Map.of("message", "Certification deleted."));
    }
}