package com.backend.ai.controller;

import com.backend.ai.dto.AIJobResponse;
import com.backend.ai.dto.CreateAIJobRequest;
import com.backend.ai.entity.AIJob;
import com.backend.ai.repo.AIJobRepo;
import com.backend.document.entity.Document;
import com.backend.document.repo.DocumentRepo;
import com.backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/jobs")
@RequiredArgsConstructor
public class AIJobController {

    private final AIJobRepo aiJobRepo;
    private final DocumentRepo documentRepo;

    @PostMapping
    public ResponseEntity<AIJobResponse> createJob(
            @Valid @RequestBody CreateAIJobRequest request,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        Document document = null;

        if (request.getDocumentId() != null) {

            document = documentRepo.findByIdAndUserId(
                                    request.getDocumentId(),
                                    user.getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Document not found"
                                    )
                            );
        }

        AIJob job = AIJob.builder()
                        .user(user)
                        .document(document)
                        .taskType(request.getTaskType())
                        .prompt(request.getPrompt())
                        .build();

        aiJobRepo.save(job);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(job));
    }

    @GetMapping
    public List<AIJobResponse> getJobs(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return aiJobRepo
                .findAllByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public AIJobResponse getJob(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        AIJob job = aiJobRepo.findByIdAndUserId(id, user.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "AI job not found"
                                )
                        );

        return toResponse(job);
    }

    private AIJobResponse toResponse(AIJob job) {

        return new AIJobResponse(
                job.getId(),
                job.getDocument() != null
                        ? job.getDocument().getId()
                        : null,
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