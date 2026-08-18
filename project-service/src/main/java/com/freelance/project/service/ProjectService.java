package com.freelance.project.service;

import com.freelance.project.dto.*;
import com.freelance.project.entity.*;
import com.freelance.project.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.*;

import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRoleRequirementRepository roleRequirementRepository;
    private final RestTemplate restTemplate;

    public ProjectService(ProjectRepository projectRepository,
                          ApplicationRepository applicationRepository,
                          TeamRepository teamRepository,
                          TeamMemberRepository teamMemberRepository,
                          ProjectRoleRequirementRepository roleRequirementRepository) {
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.roleRequirementRepository = roleRequirementRepository;
        this.restTemplate = new RestTemplate();
    }

    // Creates both INDIVIDUAL and TEAM projects
    public Project createProject(ProjectRequestDTO dto) {
        Project project = new Project();
        project.setClientId(dto.getClientId());
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectType(dto.getProjectType());
        project.setBudget(dto.getBudget());
        project.setDeadline(dto.getDeadline());
        project.setRequiredSkills(dto.getRequiredSkills());
        project.setCategory(dto.getCategory());

        // For TEAM projects: map each RoleRequirementDTO to entity
        if (dto.getProjectType() == ProjectType.TEAM && dto.getRoleRequirements() != null) {
            for (RoleRequirementDTO roleDTO : dto.getRoleRequirements()) {
                ProjectRoleRequirement req = new ProjectRoleRequirement();
                req.setRoleName(roleDTO.getRoleName());
                req.setTotalSlots(roleDTO.getTotalSlots());
                req.setFilledSlots(0);
                req.setProject(project); // Bidirectional mapping
                project.getRoleRequirements().add(req);
            }
        }

        return projectRepository.save(project);
    }

    public List<Project> getAllOpenProjects() {
        return projectRepository.findByStatus(ProjectStatus.OPEN);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public List<Project> getProjectsByClient(Long clientId) {
        return projectRepository.findByClientId(clientId);
    }

    // Fetch projects where a freelancer has been ACCEPTED or is a TeamMember
    public List<Project> getProjectsByFreelancer(Long freelancerId) {
        Set<Long> projectIds = new LinkedHashSet<>();

        // 1. Accepted Applications
        List<Application> apps = applicationRepository.findByFreelancerId(freelancerId);
        for (Application app : apps) {
            if (app.getStatus() == ApplicationStatus.ACCEPTED && app.getProjectId() != null) {
                projectIds.add(app.getProjectId());
            }
        }

        // 2. Team Member mapping
        List<TeamMember> members = teamMemberRepository.findByUserId(freelancerId);
        for (TeamMember m : members) {
            if (m.getTeamId() != null) {
                teamRepository.findById(m.getTeamId()).ifPresent(t -> {
                    if (t.getProjectId() != null) projectIds.add(t.getProjectId());
                });
            }
        }

        if (projectIds.isEmpty()) {
            return List.of();
        }

        return projectRepository.findAllById(projectIds);
    }

    public Project updateProjectStatus(Long projectId, ProjectStatus status) {
        Project project = getProjectById(projectId);
        project.setStatus(status);
        return projectRepository.save(project);
    }

    // Enforce Idempotency — One application per freelancer per project
    public Application applyToProject(Application application) {
        if (applicationRepository.existsByFreelancerIdAndProjectId(application.getFreelancerId(), application.getProjectId())) {
            throw new RuntimeException("You have already applied to this project.");
        }
        return applicationRepository.save(application);
    }

    private Map<String, String> fetchUserDetails(Long userId) {
        Map<String, String> details = new HashMap<>();
        if (userId == null) return details;
        try {
            String url = "http://localhost:8081/api/users/profile/" + userId;
            Map<?, ?> user = restTemplate.getForObject(url, Map.class);
            if (user != null) {
                String fName = user.get("firstName") != null ? user.get("firstName").toString() : "";
                String lName = user.get("lastName") != null ? user.get("lastName").toString() : "";
                String email = user.get("email") != null ? user.get("email").toString() : "";
                String name = user.get("name") != null ? user.get("name").toString() : "";

                String fullName = (fName + " " + lName).trim();
                if (fullName.isEmpty() && !name.isEmpty()) {
                    fullName = name;
                }
                if (fullName.isEmpty() && !email.isEmpty()) {
                    fullName = email.split("@")[0];
                }
                details.put("fullName", fullName.isEmpty() ? "Freelancer #" + userId : fullName);
                details.put("email", email.isEmpty() ? "freelancer" + userId + "@platform.com" : email);
                return details;
            }
        } catch (Exception ignored) {
            // Fallback if auth-service is temporarily offline or disconnected
        }
        details.put("fullName", "Freelancer #" + userId);
        details.put("email", "freelancer" + userId + "@platform.com");
        return details;
    }

    public List<Application> getApplicationsByProject(Long projectId) {
        List<Application> apps = applicationRepository.findByProjectId(projectId);
        for (Application app : apps) {
            if (app.getFreelancerId() != null) {
                Map<String, String> details = fetchUserDetails(app.getFreelancerId());
                app.setFreelancerName(details.get("fullName"));
                app.setFreelancerEmail(details.get("email"));
            }
        }
        return apps;
    }

    public List<Application> getApplicationsByFreelancer(Long freelancerId) {
        return applicationRepository.findByFreelancerId(freelancerId);
    }


    @Transactional
    public Application acceptApplication(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (app.getStatus() == ApplicationStatus.ACCEPTED) {
            throw new RuntimeException("Application already accepted.");
        }

        // 1. Update Role Capacity
        String roleName = "Hired Freelancer";
        if (app.getProjectRoleId() != null) {
            ProjectRoleRequirement role = roleRequirementRepository
                    .findById(app.getProjectRoleId())
                    .orElseThrow(() -> new RuntimeException("Project role not found"));

            if (role.isFull()) {
                throw new RuntimeException("Role '" + role.getRoleName() + "' is already fully staffed.");
            }

            role.setFilledSlots(role.getFilledSlots() + 1);
            roleRequirementRepository.save(role);
            roleName = role.getRoleName();
        }

        app.setStatus(ApplicationStatus.ACCEPTED);
        Application saved = applicationRepository.save(app);

        // 2. Find or Create Team
        Team team = teamRepository.findByProjectId(app.getProjectId())
                .orElseGet(() -> {
                    Team newTeam = new Team();
                    newTeam.setProjectId(app.getProjectId());
                    newTeam.setTeamName("Project #" + app.getProjectId() + " Team");
                    return teamRepository.save(newTeam);
                });

        // 3. Add Member with Real Name/Email
        if (!teamMemberRepository.existsByTeamIdAndUserId(team.getId(), app.getFreelancerId())) {
            TeamMember member = new TeamMember();
            member.setTeamId(team.getId());
            member.setUserId(app.getFreelancerId());
            member.setRole(roleName);

            // Fetch Real User Details from Auth Service via REST
            Map<String, String> details = fetchUserDetails(app.getFreelancerId());
            member.setUserName(details.get("fullName"));
            member.setUserEmail(details.get("email"));

            teamMemberRepository.save(member);
        }

        return saved;
    }

    public Application rejectApplication(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(ApplicationStatus.REJECTED);
        return applicationRepository.save(app);
    }

    public Team getTeamByProject(Long projectId) {
        return teamRepository.findByProjectId(projectId)
                .orElseThrow(() -> new RuntimeException("Team not formed yet"));
    }

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }
}