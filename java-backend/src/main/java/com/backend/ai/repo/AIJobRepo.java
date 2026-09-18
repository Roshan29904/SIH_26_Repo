package com.backend.ai.repo;

import com.backend.ai.entity.AIJob;
import com.backend.ai.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AIJobRepo extends JpaRepository<AIJob, Long> {

    List<AIJob> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<AIJob> findByIdAndUserId(Long id, Long userId);

    List<AIJob> findAllByStatus(JobStatus status);
}