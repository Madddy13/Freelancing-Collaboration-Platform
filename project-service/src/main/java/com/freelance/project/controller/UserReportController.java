package com.freelance.project.controller;

import com.freelance.project.entity.UserReport;
import com.freelance.project.repository.UserReportRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class UserReportController {

    private final UserReportRepository userReportRepository;

    public UserReportController(UserReportRepository userReportRepository) {
        this.userReportRepository = userReportRepository;
    }

    // Submit a report (for Clients & Freelancers)
    @PostMapping("/submit")
    public ResponseEntity<?> submitReport(@RequestBody Map<String, String> body,
                                           @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String subject = body.get("subject");
        String description = body.get("description");
        String email = body.get("email");
        String role = body.get("role");

        if (subject == null || subject.trim().isEmpty() || description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Subject and description are required."));
        }

        Long senderId = null;
        if (headerUserId != null && !headerUserId.trim().isEmpty()) {
            try {
                senderId = Long.parseLong(headerUserId.trim());
            } catch (NumberFormatException ignored) {}
        }

        UserReport report = new UserReport(senderId, email, role, subject.trim(), description.trim());
        UserReport saved = userReportRepository.save(report);
        return ResponseEntity.ok(saved);
    }

    // Admin: Get all user submitted reports
    @GetMapping("/user-reports")
    public ResponseEntity<List<UserReport>> getAllUserReports() {
        return ResponseEntity.ok(userReportRepository.findAllByOrderByCreatedAtDesc());
    }

    // Admin: Toggle or update status (RESOLVED / PENDING)
    @PutMapping("/user-reports/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestParam String status) {
        return userReportRepository.findById(id).map(report -> {
            report.setStatus(status);
            userReportRepository.save(report);
            return ResponseEntity.ok(report);
        }).orElse(ResponseEntity.notFound().build());
    }
}
