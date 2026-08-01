package com.freelance.project.repository;

import com.freelance.project.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByProjectId(Long projectId);
    List<Application> findByFreelancerId(Long freelancerId);
    Boolean existsByFreelancerIdAndProjectId(Long freelancerId, Long projectId);
    Optional<Application> findByFreelancerIdAndProjectId(Long freelancerId, Long projectId);
}