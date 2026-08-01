package com.freelance.project.repository;

import com.freelance.project.entity.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserReportRepository extends JpaRepository<UserReport, Long> {
    List<UserReport> findAllByOrderByCreatedAtDesc();
}
