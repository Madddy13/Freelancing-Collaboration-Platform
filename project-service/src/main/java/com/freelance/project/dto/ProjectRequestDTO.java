package com.freelance.project.dto;

import com.freelance.project.entity.ProjectType;
import java.util.List;

public class ProjectRequestDTO {

    private Long clientId;
    private String title;
    private String description;
    private ProjectType projectType; // INDIVIDUAL or TEAM
    private Double budget;
    private String deadline;
    private String requiredSkills;
    private String category;

    // Only populated for TEAM projects
    private List<RoleRequirementDTO> roleRequirements;

    public ProjectRequestDTO() {}

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ProjectType getProjectType() { return projectType; }
    public void setProjectType(ProjectType projectType) { this.projectType = projectType; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<RoleRequirementDTO> getRoleRequirements() { return roleRequirements; }
    public void setRoleRequirements(List<RoleRequirementDTO> roleRequirements) { this.roleRequirements = roleRequirements; }
}