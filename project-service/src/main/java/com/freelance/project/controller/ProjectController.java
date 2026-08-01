package com.freelance.project.controller;

import com.freelance.project.dto.ProjectRequestDTO;
import com.freelance.project.entity.*;
import com.freelance.project.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody ProjectRequestDTO dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        
        if ((dto.getClientId() == null || dto.getClientId() == 0) && headerUserId != null && !headerUserId.trim().isEmpty()) {
            try {
                dto.setClientId(Long.parseLong(headerUserId.trim()));
            } catch (NumberFormatException ignored) {}
        }
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllOpenProjects() {
        return ResponseEntity.ok(projectService.getAllOpenProjects());
    }

    // Admin endpoint to get ALL projects (regardless of status)
    @GetMapping("/all")
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // Secured "My Projects" endpoint for Clients
    @GetMapping("/my-projects")
    public ResponseEntity<List<Project>> getMyProjects(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "clientId", required = false) Long paramClientId) {

        Long effectiveClientId = paramClientId;
        if (effectiveClientId == null && headerUserId != null && !headerUserId.trim().isEmpty()) {
            try {
                effectiveClientId = Long.parseLong(headerUserId.trim());
            } catch (NumberFormatException ignored) {}
        }

        if (effectiveClientId == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(projectService.getProjectsByClient(effectiveClientId));
    }

    // Fetch projects where freelancer is hired/accepted
    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<Project>> getProjectsByFreelancer(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(projectService.getProjectsByFreelancer(freelancerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Project>> getProjectsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(projectService.getProjectsByClient(clientId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Project> updateProjectStatus(@PathVariable Long id, @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.updateProjectStatus(id, status));
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyToProject(@RequestBody Application application) {
        try {
            return ResponseEntity.ok(projectService.applyToProject(application));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{projectId}/applications")
    public ResponseEntity<List<Application>> getApplications(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getApplicationsByProject(projectId));
    }

    @GetMapping("/applications/freelancer/{freelancerId}")
    public ResponseEntity<List<Application>> getApplicationsByFreelancer(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(projectService.getApplicationsByFreelancer(freelancerId));
    }

    // ACCEPT application with transactional slot tracking
    @PutMapping("/applications/{applicationId}/accept")
    public ResponseEntity<Application> acceptApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(projectService.acceptApplication(applicationId));
    }

    // REJECT application
    @PutMapping("/applications/{applicationId}/reject")
    public ResponseEntity<Application> rejectApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(projectService.rejectApplication(applicationId));
    }

    @GetMapping("/{projectId}/team")
    public ResponseEntity<Team> getTeamByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getTeamByProject(projectId));
    }

    @GetMapping("/teams/{teamId}/members")
    public ResponseEntity<List<TeamMember>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(projectService.getTeamMembers(teamId));
    }
}