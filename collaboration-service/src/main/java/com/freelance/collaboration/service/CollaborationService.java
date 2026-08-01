package com.freelance.collaboration.service;

import com.freelance.collaboration.entity.*;
import com.freelance.collaboration.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CollaborationService {

    private final TaskRepository taskRepository;
    private final ChatMessageRepository chatMessageRepository;

    public CollaborationService(TaskRepository taskRepository, ChatMessageRepository chatMessageRepository) {
        this.taskRepository = taskRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    // Task Methods
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public Task updateTaskStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public Task assignTask(Long taskId, Long assignedToUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setAssignedToUserId(assignedToUserId);
        return taskRepository.save(task);
    }

    // Chat Methods
    public ChatMessage sendMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessagesByProject(Long projectId) {
        return chatMessageRepository.findByProjectIdOrderBySentAtAsc(projectId);
    }
}