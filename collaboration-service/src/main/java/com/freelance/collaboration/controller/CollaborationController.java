package com.freelance.collaboration.controller;

import com.freelance.collaboration.entity.*;
import com.freelance.collaboration.service.CollaborationService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CollaborationController {

    private final CollaborationService collaborationService;
    private final SimpMessagingTemplate messagingTemplate;

    public CollaborationController(CollaborationService collaborationService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.collaborationService = collaborationService;
        this.messagingTemplate = messagingTemplate;
    }

    // Create Kanban Task
    @PostMapping("/tasks")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(collaborationService.createTask(task));
    }

    // Get Project Kanban Tasks
    @GetMapping("/tasks/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(collaborationService.getTasksByProject(projectId));
    }

    // Update Task Status (Kanban Drag-and-Drop)
    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(collaborationService.updateTaskStatus(taskId, status));
    }

    // Assign Task
    @PutMapping("/tasks/{taskId}/assign")
    public ResponseEntity<Task> assignTask(@PathVariable Long taskId, @RequestParam(required = false) Long assignedToUserId) {
        return ResponseEntity.ok(collaborationService.assignTask(taskId, assignedToUserId));
    }

    // Send Chat Message (Persists to MySQL & broadcasts via WebSocket)
    @PostMapping("/chat")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message) {
        if (message.getSentAt() == null) {
            message.setSentAt(LocalDateTime.now());
        }
        ChatMessage saved = collaborationService.sendMessage(message);
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + message.getProjectId(), saved);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(saved);
    }

    // WebSocket STOMP Message Mapping
    @MessageMapping("/chat/{projectId}")
    @SendTo("/topic/chat/{projectId}")
    public ChatMessage handleWebSocketMessage(@DestinationVariable Long projectId, ChatMessage message) {
        if (message.getSentAt() == null) {
            message.setSentAt(LocalDateTime.now());
        }
        return collaborationService.sendMessage(message);
    }

    // Get Chat History by Project ID & User ID
    @GetMapping("/chat/history/{projectId}")
    public ResponseEntity<List<ChatMessage>> getMessagesByProjectHistory(
            @PathVariable Long projectId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        List<ChatMessage> messages = collaborationService.getMessagesByProject(projectId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/chat/project/{projectId}")
    public ResponseEntity<List<ChatMessage>> getMessagesByProject(
            @PathVariable Long projectId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        return getMessagesByProjectHistory(projectId, userId, headerUserId);
    }
}