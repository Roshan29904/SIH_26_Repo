package com.backend.user.controller;

import com.backend.user.dto.DeviceResponse;
import com.backend.user.dto.UserResponse;
import com.backend.user.entity.User;
import com.backend.user.entity.UserDevice;
import com.backend.user.repo.UserDeviceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserDeviceRepo userDeviceRepo;

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEmailVerified(),
                user.isEnabled(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    @GetMapping("/devices")
    public List<DeviceResponse> getDevices(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return userDeviceRepo
                .findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @DeleteMapping("/devices/{deviceId}")
    public Map<String, String> revokeDevice(
            @PathVariable Long deviceId,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        UserDevice device =
                userDeviceRepo.findById(deviceId)
                        .orElseThrow(() -> new RuntimeException("Device not found"));

        // user can revoke only their own device
        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        device.setRevoked(true);
        userDeviceRepo.save(device);

        return Map.of(
                "message",
                "Device revoked successfully"
        );
    }

    private DeviceResponse toResponse(UserDevice device) {
        return new DeviceResponse(
                device.getId(),
                device.getDeviceId(),
                device.getDeviceName(),
                device.getPlatform(),
                device.isApproved(),
                device.isRevoked(),
                device.getLastSeen(),
                device.getCreatedAt()
        );
    }
}