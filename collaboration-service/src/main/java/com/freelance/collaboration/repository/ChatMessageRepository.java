package com.freelance.collaboration.repository;

import com.freelance.collaboration.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByProjectIdOrderBySentAtAsc(Long projectId);
}