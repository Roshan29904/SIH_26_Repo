package com.backend.ai.dto;

import com.backend.ai.entity.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AIJobResponse {

    private Long id;
    private Long documentId;
    private String taskType;
    private String prompt;
    private JobStatus status;
    private String result;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}