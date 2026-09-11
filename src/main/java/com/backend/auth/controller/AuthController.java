package com.backend.auth.controller;

import com.backend.auth.dto.*;
import com.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        authService.signup(request);
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Signup successful. OTP sent to your email."
                )
        );
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        authService.verifySignup(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Email verified successfully. Account activated."
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {
        authService.login(request);
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Credentials verified. OTP sent to your email."
                )
        );
    }

    @PostMapping("/verify-login")
    public ResponseEntity<AuthResponse> verifyLogin(
            @Valid @RequestBody VerifyOtpRequest request,
            @RequestHeader("X-Device-Id") String deviceId,
            @RequestHeader(value = "X-Device-Name", defaultValue = "Unknown Device") String deviceName,
            @RequestHeader(value = "X-Platform", defaultValue = "WEB") String platform
    ) {
        AuthResponse response = authService.verifyLogin(
                request.getEmail(),
                request.getOtp(),
                deviceId,
                deviceName,
                platform
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        AuthResponse response =
                authService.refreshAccessToken(
                        request.getRefreshToken()
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());

        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully")
        );
    }
}