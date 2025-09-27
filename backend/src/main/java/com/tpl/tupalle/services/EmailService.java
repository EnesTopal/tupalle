package com.tpl.tupalle.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private final SesClient sesClient;
    private final String fromEmail;

    public EmailService(@Value("${aws.ses.access-key}") String accessKey,
                       @Value("${aws.ses.secret-key}") String secretKey,
                       @Value("${aws.ses.region}") String region,
                       @Value("${aws.ses.from-email}") String fromEmail) {
        
        this.fromEmail = fromEmail;
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        this.sesClient = SesClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }

    public CompletableFuture<Void> sendVerificationEmail(String toEmail, String username, String verificationToken) {
        return CompletableFuture.runAsync(() -> {
            try {
                String subject = "Verify Your Email - Tupalle";
                String body = createVerificationEmailBody(username, verificationToken);
                
                sendEmail(toEmail, subject, body);
            } catch (Exception e) {
                throw new RuntimeException("Failed to send verification email", e);
            }
        });
    }

    public CompletableFuture<Void> sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        return CompletableFuture.runAsync(() -> {
            try {
                String subject = "Reset Your Password - Tupalle";
                String body = createPasswordResetEmailBody(username, resetToken);
                
                sendEmail(toEmail, subject, body);
            } catch (Exception e) {
                throw new RuntimeException("Failed to send password reset email", e);
            }
        });
    }

    private void sendEmail(String toEmail, String subject, String body) {
        try {
            Destination destination = Destination.builder()
                    .toAddresses(toEmail)
                    .build();

            Message message = Message.builder()
                    .subject(Content.builder()
                            .data(subject)
                            .charset("UTF-8")
                            .build())
                    .body(Body.builder()
                            .text(Content.builder()
                                    .data(body)
                                    .charset("UTF-8")
                                    .build())
                            .build())
                    .build();

            SendEmailRequest emailRequest = SendEmailRequest.builder()
                    .destination(destination)
                    .message(message)
                    .source(fromEmail)
                    .build();

            System.out.println("Sending email to " + toEmail);
            sesClient.sendEmail(emailRequest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email via AWS SES", e);
        }
    }

    private String createVerificationEmailBody(String username, String verificationToken) {
        return String.format("""
                Hello %s,
                
                Welcome to Tupalle! Please verify your email address by clicking the link below:
                
                http://localhost:18089/auth/verify-email?token=%s
                
                This link will expire in 24 hours.
                
                If you didn't create an account with Tupalle, please ignore this email.
                
                Best regards,
                The Tupalle Team
                """, username, verificationToken);
    }

    private String createPasswordResetEmailBody(String username, String resetToken) {
        return String.format("""
                Hello %s,
                
                You requested to reset your password. Click the link below to reset it:
                
                http://localhost:18089/auth/reset-password?token=%s
                
                This link will expire in 15 minutes.
                
                If you didn't request a password reset, please ignore this email.
                
                Best regards,
                The Tupalle Team
                """, username, resetToken);
    }
}
