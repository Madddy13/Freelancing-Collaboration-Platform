package com.freelance.project.controller;

import com.freelance.project.entity.Project;
import com.freelance.project.entity.ProjectStatus;
import com.freelance.project.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class AdminReportController {

    private final ProjectService projectService;

    public AdminReportController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/platform-stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        List<Project> allProjects = projectService.getAllProjects();
        
        long totalProjects = allProjects.size();
        long openProjects = allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.OPEN).count();
        long completedProjects = allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.CLOSED).count();
        
        double totalRevenue = allProjects.stream()
                .filter(p -> p.getBudget() != null)
                .mapToDouble(Project::getBudget)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", totalProjects);
        stats.put("openProjects", openProjects);
        stats.put("completedProjects", completedProjects);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }
}
