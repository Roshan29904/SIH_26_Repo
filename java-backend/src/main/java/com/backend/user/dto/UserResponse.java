package com.backend.user.dto;

import com.backend.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private boolean emailVerified;
    private boolean enabled;
    private Role role;
    private LocalDateTime createdAt;
}