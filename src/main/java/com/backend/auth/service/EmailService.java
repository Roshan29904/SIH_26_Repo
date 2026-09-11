package com.backend.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendOtp(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(email);
        message.setSubject("FORGE - Email Verification OTP");

        message.setText(
                "Your FORGE verification code is: " + otp +
                        "\n\nThis OTP is valid for 10 minutes." +
                        "\n\nIf you did not request this code, please ignore this email."
        );

        mailSender.send(message);
    }
}