package com.backend.chat.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {

    private Long documentId;

    private String taskType;

    @NotBlank
    @JsonAlias({"text", "message"})
    private String prompt;
}
