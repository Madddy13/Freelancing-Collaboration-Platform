package com.freelance.project.repository;

import com.freelance.project.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.freelance.project.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByProjectId(Long projectId);
    @Query(value = "SELECT first_name, last_name, email FROM users WHERE id = :userId", nativeQuery = true)
    List<Object[]> findUserDetailsByUserId(@Param("userId") Long userId);
}