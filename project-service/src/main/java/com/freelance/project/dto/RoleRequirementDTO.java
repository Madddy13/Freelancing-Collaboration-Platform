package com.freelance.project.dto;

public class RoleRequirementDTO {
    private String roleName;
    private int totalSlots;

    public RoleRequirementDTO() {}

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }
}