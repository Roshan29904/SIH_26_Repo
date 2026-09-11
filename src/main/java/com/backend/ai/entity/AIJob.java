package com.backend.ai.entity;

import com.backend.document.entity.Document;
import com.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ai_jobs",
        indexes = {
                @Index(
                        name = "idx_ai_job_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_ai_job_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_ai_job_document",
                        columnList = "document_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(
            name = "task_type",
            nullable = false,
            length = 50
    )
    private String taskType;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String prompt;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private JobStatus status;

    @Column(
            columnDefinition = "TEXT"
    )
    private String result;

    @Column(
            name = "error_message",
            columnDefinition = "TEXT"
    )
    private String errorMessage;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();

        if (status == null) {
            status = JobStatus.QUEUED;
        }
    }
}