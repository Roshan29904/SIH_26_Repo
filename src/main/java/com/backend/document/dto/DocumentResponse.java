package com.backend.document.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DocumentResponse {

    private Long id;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    private LocalDateTime createdAt;
}