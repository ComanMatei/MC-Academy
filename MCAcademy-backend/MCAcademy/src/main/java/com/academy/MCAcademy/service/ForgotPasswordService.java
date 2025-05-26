package com.academy.MCAcademy.service;

import com.academy.MCAcademy.exception.EmailNotFoundException;
import com.academy.MCAcademy.request.EmailRequest;
import com.academy.MCAcademy.response.EmailResponse;
import com.academy.MCAcademy.request.ResetPasswordRequest;
import com.academy.MCAcademy.entity.ConfirmationToken;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.mailing.EmailSender;
import com.academy.MCAcademy.repository.ConfirmationTokenRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ForgotPasswordService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final ConfirmationTokenService confirmationTokenService;

    private final ConfirmationTokenRepository confirmationTokenRepository;

    private final EmailSender emailSender;

    private final BuildEmailService buildEmailService;

    @Transactional
    public String confirmToken(String token) {
        ConfirmationToken confirmationToken = confirmationTokenService
                .getToken(token)
                .orElseThrow(() -> new IllegalStateException("Token not found"));

        if (confirmationToken.getConfirmedAt() != null) {
            throw new IllegalStateException("Token already used");
        }

        if (confirmationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expired");
        }

        confirmationTokenService.setConfirmedAt(token);
        userRepository.enableUser(confirmationToken.getUser().getEmail());

        return "confirmed";
    }

    public EmailResponse verifyEmail(EmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EmailNotFoundException("Email not found"));

        String token = generateResetToken(user);

        String subject = "Reset Your Password";
        String name = user.getFirstname() + " " + user.getLastname();
        String body = "You requested to reset your password. Click the link below to create a new password:";
        String link = "http://localhost:8080/api/v1/forgotpassword/reset?token=" + token;
        String linkName = "Reset Password";
        String notice = "Link will expire in 15 minutes.";
        String signiture = "MC Academy Team!";

        emailSender.send(request.getEmail(),
                buildEmailService.buildEmail(subject, name, body, link, linkName, notice, signiture));

        return EmailResponse.builder()
                .confirmToken(token)
                .build();
    }

    public String generateResetToken(User user) {
        String token = UUID.randomUUID().toString();

        ConfirmationToken confirmationToken = new ConfirmationToken(
                token,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(15),
                user
        );

        confirmationTokenService.saveConfirmationToken(confirmationToken);
        return token;
    }

    @Transactional
    public String resetPassword(String token, ResetPasswordRequest request) {
        Optional<User> userOptional = confirmationTokenRepository.findUserByToken(token);
        if (userOptional.isEmpty()){
            throw new RuntimeException("This user dosen't exist!");
        }

        ConfirmationToken confirmationToken = confirmationTokenService
                .getToken(token)
                .orElseThrow(() -> new IllegalStateException("Token not found"));

        if (confirmationToken.getConfirmedAt() == null) {
            throw new IllegalStateException("Token not confirmed");
        }

        User user = userOptional.get();
        if(request.getNewPassword().equals(request.getRepetPassword())) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        }
        else {
            throw new RuntimeException("The password are not the same!");
        }

        return "Password has been successfully reset.";
    }
}
