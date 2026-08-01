package com.freelance.collaboration.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatFileUploadController {

    @Value("${app.upload.dir:uploads/chat}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadChatFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot upload empty file."));
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/chat/" + fileName;

            return ResponseEntity.ok(Map.of(
                "fileUrl", fileUrl,
                "fileName", file.getOriginalFilename(),
                "fileSize", file.getSize(),
                "contentType", file.getContentType() != null ? file.getContentType() : "application/octet-stream"
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file attachment."));
        }
    }
}
