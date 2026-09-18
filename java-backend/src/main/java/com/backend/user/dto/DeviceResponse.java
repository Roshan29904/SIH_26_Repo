package com.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DeviceResponse {

    private Long id;
    private String deviceId;
    private String deviceName;
    private String platform;
    private boolean approved;
    private boolean revoked;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
}