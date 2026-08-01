package com.freelance.project.service;

import com.freelance.project.dto.*;
import com.freelance.project.entity.*;
import com.freelance.project.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRoleRequirementRepository roleRequirementRepository;

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

    public List<Application> getApplicationsByProject(Long projectId) {
        List<Application> apps = applicationRepository.findByProjectId(projectId);
        for (Application app : apps) {
            if (app.getFreelancerId() != null) {
                try {
                    List<Object[]> userDetails = teamRepository.findUserDetailsByUserId(app.getFreelancerId());
                    if (userDetails != null && !userDetails.isEmpty()) {
                        Object[] row = userDetails.get(0);
                        String fName = row[0] != null ? row[0].toString() : "";
                        String lName = row[1] != null ? row[1].toString() : "";
                        String email = row[2] != null ? row[2].toString() : "";
                        
                        String fullName = (fName + " " + lName).trim();
                        app.setFreelancerName(!fullName.isEmpty() ? fullName : email.split("@")[0]);
                        app.setFreelancerEmail(email);
                    } else {
                        app.setFreelancerName("Freelancer #" + app.getFreelancerId());
                        app.setFreelancerEmail("freelancer" + app.getFreelancerId() + "@platform.com");
                    }
                } catch (Exception e) {
                    app.setFreelancerName("Freelancer #" + app.getFreelancerId());
                    app.setFreelancerEmail("freelancer" + app.getFreelancerId() + "@platform.com");
                }
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

            // Fetch Real User Details from MySQL
            try {
                List<Object[]> userDetails = teamRepository.findUserDetailsByUserId(app.getFreelancerId());
                if (userDetails != null && !userDetails.isEmpty()) {
                    Object[] row = userDetails.get(0);
                    String fName = row[0] != null ? row[0].toString() : "";
                    String lName = row[1] != null ? row[1].toString() : "";
                    String email = row[2] != null ? row[2].toString() : "";
                    
                    String fullName = (fName + " " + lName).trim();
                    member.setUserName(!fullName.isEmpty() ? fullName : email.split("@")[0]);
                    member.setUserEmail(email);
                } else {
                  member.setUserName("Freelancer #" + app.getFreelancerId());
                  member.setUserEmail("freelancer" + app.getFreelancerId() + "@platform.com");
                }
            } catch (Exception e) {
                member.setUserName("Freelancer #" + app.getFreelancerId());
                member.setUserEmail("freelancer" + app.getFreelancerId() + "@platform.com");
            }

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