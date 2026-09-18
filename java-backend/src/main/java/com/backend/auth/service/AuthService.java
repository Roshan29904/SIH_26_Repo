package com.backend.auth.service;

import com.backend.auth.dto.AuthResponse;
import com.backend.auth.dto.LoginRequest;
import com.backend.auth.dto.SignupRequest;
import com.backend.auth.entity.OtpPurpose;
import com.backend.auth.entity.RefreshToken;
import com.backend.auth.repo.RefreshTokenRepo;
import com.backend.user.entity.Role;
import com.backend.user.entity.User;
import com.backend.user.entity.UserDevice;
import com.backend.user.repo.UserDeviceRepo;
import com.backend.user.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final UserDeviceRepo userDeviceRepo;
    private final RefreshTokenRepo refreshTokenRepo;

    private final OtpService otpService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void signup(SignupRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepo.existsByEmail(email)) {
            throw new RuntimeException(
                    "An account with this email already exists"
            );
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .enabled(false)
                .role(Role.USER)
                .build();

        userRepo.save(user);

        otpService.sendOtp(email, OtpPurpose.SIGNUP);
    }

    @Transactional
    public void verifySignup(String email, String otp) {

        email = email.trim().toLowerCase();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (user.isEmailVerified()) {
            throw new RuntimeException(
                    "Email is already verified"
            );
        }

        boolean valid = otpService.verifyOtp(email, otp, OtpPurpose.SIGNUP);

        if (!valid) {
            throw new RuntimeException(
                    "Invalid or expired OTP"
            );
        }

        user.setEmailVerified(true);
        user.setEnabled(true);

        userRepo.save(user);
    }

    @Transactional
    public void login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException(
                    "Please verify your email first"
            );
        }

        if (!user.isEnabled()) {
            throw new RuntimeException(
                    "Account is disabled"
            );
        }

        otpService.sendOtp(email, OtpPurpose.LOGIN);
    }

    @Transactional
    public AuthResponse verifyLogin(
            String email,
            String otp,
            String deviceId,
            String deviceName,
            String platform
    ) {

        email = email.trim().toLowerCase();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean valid = otpService.verifyOtp(email, otp, OtpPurpose.LOGIN);

        if (!valid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        UserDevice device =
                userDeviceRepo
                        .findByUserIdAndDeviceId(
                                user.getId(),
                                deviceId
                        ).orElse(null);

        if (device == null) {

            device = UserDevice.builder()
                    .user(user)
                    .deviceId(deviceId)
                    .deviceName(deviceName)
                    .platform(platform)
                    .approved(true)
                    .revoked(false)
                    .lastSeen(LocalDateTime.now())
                    .build();

            userDeviceRepo.save(device);

        }
        else {

            if (device.isRevoked()) {
                throw new RuntimeException(
                        "This device has been revoked"
                );
            }

            if (!device.isApproved()) {
                throw new RuntimeException(
                        "This device is not approved"
                );
            }

            device.setLastSeen(LocalDateTime.now());

            userDeviceRepo.save(device);
        }

        String accessToken = jwtService.generateAccessToken(user, device.getId());

        String refreshToken = generateRefreshToken();

        String refreshTokenHash = hashRefreshToken(refreshToken);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .device(device)
                .tokenHash(refreshTokenHash)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .revoked(false)
                .build();

        refreshTokenRepo.save(token);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer"
        );
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {

        String tokenHash = hashRefreshToken(refreshToken);

        RefreshToken storedToken = refreshTokenRepo
                        .findByTokenHashAndRevokedFalse(tokenHash)
                        .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepo.save(storedToken);

            throw new RuntimeException("Refresh token expired");
        }

        User user = storedToken.getUser();
        if (storedToken.getDevice() != null && storedToken.getDevice().isRevoked()) {

            storedToken.setRevoked(true);
            refreshTokenRepo.save(storedToken);

            throw new RuntimeException("Device has been revoked");
        }

        if (!user.isEnabled() || !user.isEmailVerified()) {
            throw new RuntimeException("User account is not active");
        }

        storedToken.setRevoked(true);
        refreshTokenRepo.save(storedToken);

        String accessToken = jwtService.generateAccessToken(user, storedToken.getDevice().getId());

        String newRefreshToken = generateRefreshToken();

        String newRefreshTokenHash = hashRefreshToken(newRefreshToken);

        RefreshToken newToken = RefreshToken.builder()
                .user(user)
                .device(storedToken.getDevice())
                .tokenHash(newRefreshTokenHash)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .revoked(false)
                .build();

        refreshTokenRepo.save(newToken);

        return new AuthResponse(accessToken, newRefreshToken, "Bearer");
    }

    private String generateRefreshToken() {

        byte[] bytes = new byte[64];

        secureRandom.nextBytes(bytes);

        return java.util.Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashRefreshToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);

                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to hash refresh token", e);
        }
    }

    @Transactional
    public void logout(String refreshToken) {

        String tokenHash = hashRefreshToken(refreshToken);

        RefreshToken storedToken = refreshTokenRepo
                .findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        storedToken.setRevoked(true);
        refreshTokenRepo.save(storedToken);
    }
}