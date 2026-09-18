package com.backend.system.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SystemStatsResponse {

    private long users;
    private long documents;
    private long aiJobs;
    private long queuedJobs;
    private long processingJobs;
    private long completedJobs;
    private long failedJobs;
}
