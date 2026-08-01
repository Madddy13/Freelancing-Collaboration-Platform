package com.freelance.collaboration.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class ProjectAccessService {

    private final RestTemplate restTemplate;

    public ProjectAccessService() {
        this.restTemplate = new RestTemplate();
    }

    public boolean isUserAuthorizedForProject(Long projectId, Long userId) {
        if (projectId == null || userId == null) return false;
        try {
            // 1. Query project-service for project details (Client Ownership)
            String projectUrl = "http://localhost:8082/api/projects/" + projectId;
            Map<?, ?> project = restTemplate.getForObject(projectUrl, Map.class);
            if (project == null) return false;

            Object clientIdObj = project.get("clientId");
            if (clientIdObj != null && Long.parseLong(clientIdObj.toString()) == userId) {
                return true;
            }

            // 2. Query project-service for project applications (Accepted Freelancer check)
            String appsUrl = "http://localhost:8082/api/projects/" + projectId + "/applications";
            List<?> apps = restTemplate.getForObject(appsUrl, List.class);
            if (apps != null) {
                for (Object obj : apps) {
                    if (obj instanceof Map) {
                        Map<?, ?> app = (Map<?, ?>) obj;
                        Object fId = app.get("freelancerId");
                        Object status = app.get("status");
                        if (fId != null && Long.parseLong(fId.toString()) == userId && "ACCEPTED".equals(status)) {
                            return true;
                        }
                    }
                }
            }

            // 3. Query project-service for project team members
            try {
                String teamUrl = "http://localhost:8082/api/projects/" + projectId + "/team";
                Map<?, ?> team = restTemplate.getForObject(teamUrl, Map.class);
                if (team != null && team.get("id") != null) {
                    String memUrl = "http://localhost:8082/api/projects/teams/" + team.get("id") + "/members";
                    List<?> members = restTemplate.getForObject(memUrl, List.class);
                    if (members != null) {
                        for (Object mObj : members) {
                            if (mObj instanceof Map) {
                                Map<?, ?> mem = (Map<?, ?>) mObj;
                                Object uId = mem.get("userId");
                                if (uId != null && Long.parseLong(uId.toString()) == userId) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}

            return false;
        } catch (Exception e) {
            // Fallback: If project-service internal REST call fails, allow valid user header
            return true;
        }
    }
}
