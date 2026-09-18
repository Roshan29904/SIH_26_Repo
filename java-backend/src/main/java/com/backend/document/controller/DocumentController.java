package com.backend.document.controller;

import com.backend.document.dto.DocumentResponse;
import com.backend.document.entity.Document;
import com.backend.document.repo.DocumentRepo;
import com.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepo documentRepo;

    private final Path uploadDirectory = Paths.get("storage/documents");

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {

        User user = (User) authentication.getPrincipal();

        if (file.isEmpty()) {
            throw new RuntimeException(
                    "File cannot be empty"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null) {
            throw new RuntimeException("Unknown file type");
        }

        List<String> allowedTypes = List.of(
                "application/pdf",
                "image/png",
                "image/jpeg",
                "image/jpg",
                "text/plain",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );

        if (!allowedTypes.contains(contentType)) {
            throw new RuntimeException(
                    "Unsupported file type"
            );
        }

        Files.createDirectories(uploadDirectory);

        String originalFilename = file.getOriginalFilename();



        if (originalFilename == null
                || originalFilename.isBlank()
                || originalFilename.contains("..")
                || originalFilename.contains("/")
                || originalFilename.contains("\\")) {
            throw new RuntimeException(
                    "Invalid filename"
            );
        }

        String extension = "";

        int lastDot = originalFilename.lastIndexOf(".");

        if (lastDot >= 0) {
            extension = originalFilename.substring(lastDot);
        }

        String storedFilename = UUID.randomUUID() + extension;

        Path targetPath = uploadDirectory.resolve(storedFilename);

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        Document document =
                Document.builder()
                        .user(user)
                        .originalFilename(originalFilename)
                        .storedFilename(storedFilename)
                        .filePath(targetPath.toString())
                        .fileType(file.getContentType())
                        .fileSize(file.getSize())
                        .build();

        documentRepo.save(document);

        DocumentResponse response =
                new DocumentResponse(
                        document.getId(),
                        document.getOriginalFilename(),
                        document.getFileType(),
                        document.getFileSize(),
                        document.getCreatedAt()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public List<DocumentResponse> getDocuments(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return documentRepo
                .findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(document ->
                        new DocumentResponse(
                                document.getId(),
                                document.getOriginalFilename(),
                                document.getFileType(),
                                document.getFileSize(),
                                document.getCreatedAt()
                        )
                )
                .toList();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Document document = documentRepo.findByIdAndUserId(id, user.getId()).orElseThrow(() ->
                        new RuntimeException("Document not found")
                );

        Path path = Paths.get(document.getFilePath());

        Resource resource = new FileSystemResource(path);

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException(
                    "File not found on storage"
            );
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                document.getOriginalFilename() +
                                "\""
                )
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        document.getFileType() != null
                                ? document.getFileType()
                                : "application/octet-stream"
                )
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        Document document = documentRepo.findByIdAndUserId(id, user.getId()).orElseThrow(() ->
                        new RuntimeException("Document not found")
                );

        Path path = Paths.get(document.getFilePath());

        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete file"
            );
        }

        documentRepo.delete(document);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message",
                        "Document deleted successfully"
                )
        );
    }
}