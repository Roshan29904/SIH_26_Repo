package com.backend.system.controller;

import com.backend.ai.entity.JobStatus;
import com.backend.ai.repo.AIJobRepo;
import com.backend.document.repo.DocumentRepo;
import com.backend.system.dto.SystemStatsResponse;
import com.backend.user.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemStatsController {

    private final UserRepo userRepo;
    private final DocumentRepo documentRepo;
    private final AIJobRepo aiJobRepo;

    @GetMapping("/stats")
    public SystemStatsResponse getStats() {
        return new SystemStatsResponse(
                userRepo.count(),
                documentRepo.count(),
                aiJobRepo.count(),
                aiJobRepo.findAllByStatus(JobStatus.QUEUED).size(),
                aiJobRepo.findAllByStatus(JobStatus.PROCESSING).size(),
                aiJobRepo.findAllByStatus(JobStatus.COMPLETED).size(),
                aiJobRepo.findAllByStatus(JobStatus.FAILED).size()
        );
    }
}
