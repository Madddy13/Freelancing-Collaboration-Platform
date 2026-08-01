package com.freelance.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // ← ADD THIS IMPORT
import jakarta.persistence.*;

@Entity
@Table(name = "project_role_requirements")
public class ProjectRoleRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore // ← ADD THIS ANNOTATION TO PREVENT INFINITE RECURSION
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String roleName;

    @Column(nullable = false)
    private int totalSlots;

    @Column(nullable = false)
    private int filledSlots = 0;

    public ProjectRoleRequirement() {}

    public boolean isFull() {
        return filledSlots >= totalSlots;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }

    public int getFilledSlots() { return filledSlots; }
    public void setFilledSlots(int filledSlots) { this.filledSlots = filledSlots; }
}