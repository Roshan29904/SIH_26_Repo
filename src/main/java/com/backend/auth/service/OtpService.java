package com.backend.auth.service;

import com.backend.auth.entity.OtpPurpose;
import com.backend.auth.entity.VerificationCode;
import com.backend.auth.repo.VerificationCodeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final VerificationCodeRepo verificationCodeRepo;
    private final EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final SecureRandom secureRandom = new SecureRandom();

    public void sendOtp(String email, OtpPurpose purpose) {

        // Generate 6-digit OTP
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        // Hash OTP before storing
        String otpHash = passwordEncoder.encode(otp);

        VerificationCode verificationCode = VerificationCode.builder()
                .email(email)
                .otpHash(otpHash)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(100))
                .attempts(0)
                .used(false)
                .build();

        verificationCodeRepo.save(verificationCode);

        // Send actual OTP through email
        emailService.sendOtp(email, otp);
    }

    public boolean verifyOtp(
            String email,
            String otp,
            OtpPurpose purpose
    ) {

        VerificationCode code =
                verificationCodeRepo
                        .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                                email,
                                purpose
                        )
                        .orElse(null);

        if (code == null) {
            return false;
        }

        if (code.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (code.getAttempts() >= 5) {
            return false;
        }

        code.setAttempts(code.getAttempts() + 1);
        verificationCodeRepo.save(code);

        if (!passwordEncoder.matches(otp, code.getOtpHash())) {
            return false;
        }

        code.setUsed(true);
        verificationCodeRepo.save(code);

        return true;
    }
}