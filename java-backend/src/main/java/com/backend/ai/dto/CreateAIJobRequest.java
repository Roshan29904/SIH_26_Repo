package com.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAIJobRequest {

    private Long documentId;

    @NotBlank
    private String taskType;

    @NotBlank
    private String prompt;
}