package com.backend.auth.repo;

import com.backend.auth.entity.OtpPurpose;
import com.backend.auth.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationCodeRepo
        extends JpaRepository<VerificationCode, Long> {

    Optional<VerificationCode>
    findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String email,
            OtpPurpose purpose
    );
}