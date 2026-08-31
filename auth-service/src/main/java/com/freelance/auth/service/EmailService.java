package com.freelance.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        String verifyUrl = "http://localhost:3000/verify-email?token=" + token;
        String subject = "CollabLance — Verify Your Email Account";
        String content = "<div style='font-family: sans-serif; background: #090A0F; color: #F9FAFB; padding: 30px; border-radius: 12px;'>"
                + "<h2 style='color: #7C3AED;'>Welcome to CollabLance 🚀</h2>"
                + "<p style='color: #9CA3AF;'>Please verify your email address to complete your account setup and unlock full platform capabilities.</p>"
                + "<p><a href='" + verifyUrl + "' style='display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #7C3AED, #6366F1); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;'>Verify Email Address →</a></p>"
                + "<p style='color: #6B7280; font-size: 12px;'>If you did not request this email, please ignore it.</p>"
                + "</div>";

        sendHtmlEmail(toEmail, subject, content, verifyUrl);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String subject = "CollabLance — Reset Your Password";
        String content = "<div style='font-family: sans-serif; background: #090A0F; color: #F9FAFB; padding: 30px; border-radius: 12px;'>"
                + "<h2 style='color: #7C3AED;'>Password Reset Request 🔐</h2>"
                + "<p style='color: #9CA3AF;'>You requested a password reset for your CollabLance account. Click the button below to set a new password:</p>"
                + "<p><a href='" + resetUrl + "' style='display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #7C3AED, #6366F1); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;'>Reset Password →</a></p>"
                + "<p style='color: #6B7280; font-size: 12px;'>This link will expire in 2 hours.</p>"
                + "</div>";

        sendHtmlEmail(toEmail, subject, content, resetUrl);
    }

    private void sendHtmlEmail(String toEmail, String subject, String content, String actionUrl) {
        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(content, true);
                mailSender.send(message);
                log.info("Successfully sent email to {} with subject {}", toEmail, subject);
                return;
            } catch (Exception e) {
                log.warn("SMTP email dispatch failed: {}. Falling back to console log token output.", e.getMessage());
            }
        }
        // Fallback logger for frictionless local development
        log.info("\n========================================================"
                + "\n[EMAIL TOKEN FALLBACK LOG]"
                + "\nTo: " + toEmail
                + "\nSubject: " + subject
                + "\nAction Link: " + actionUrl
                + "\n========================================================");
    }
}