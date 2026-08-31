package com.freelance.auth.dto;

import com.freelance.auth.entity.Role;
import jakarta.validation.constraints.*;

public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String name; // Backward compatibility fallback

    @Email @NotBlank 
    private String email;

    @Size(min = 6) 
    private String password;

    private Role role;
    private String skills;

    public RegisterRequest() {}

    public String getFirstName() { 
        return firstName != null ? firstName : (name != null ? name : ""); 
    }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { 
        return lastName != null ? lastName : ""; 
    }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}