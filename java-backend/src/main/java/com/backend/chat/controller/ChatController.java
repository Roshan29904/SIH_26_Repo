package com.backend.chat.controller;

import com.backend.ai.dto.AIJobResponse;
import com.backend.ai.entity.AIJob;
import com.backend.ai.repo.AIJobRepo;
import com.backend.chat.dto.ChatMessageRequest;
import com.backend.document.entity.Document;
import com.backend.document.repo.DocumentRepo;
import com.backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AIJobRepo aiJobRepo;
    private final DocumentRepo documentRepo;

    @PostMapping("/message")
    public ResponseEntity<AIJobResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Document document = null;
        if (request.getDocumentId() != null) {
            document = documentRepo.findByIdAndUserId(request.getDocumentId(), user.getId())
                    .orElseThrow(() -> new RuntimeException("Document not found"));
        }

        String taskType = request.getTaskType();
        if (taskType == null || taskType.isBlank()) {
            taskType = document != null ? "DOCUMENT_CHAT" : "CHAT";
        }

        AIJob job = AIJob.builder()
                .user(user)
                .document(document)
                .taskType(taskType)
                .prompt(request.getPrompt())
                .build();

        aiJobRepo.save(job);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(job));
    }

    private AIJobResponse toResponse(AIJob job) {
        return new AIJobResponse(
                job.getId(),
                job.getDocument() != null ? job.getDocument().getId() : null,
                job.getTaskType(),
                job.getPrompt(),
                job.getStatus(),
                job.getResult(),
                job.getErrorMessage(),
                job.getCreatedAt(),
                job.getStartedAt(),
                job.getCompletedAt()
        );
    }
}
