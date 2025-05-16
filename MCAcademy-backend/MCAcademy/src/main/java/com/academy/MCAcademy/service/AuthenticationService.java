package com.academy.MCAcademy.service;

import com.academy.MCAcademy.request.AuthenticationRequest;
import com.academy.MCAcademy.request.RefreshTokenRequest;
import com.academy.MCAcademy.response.AuthenticationResponse;
import com.academy.MCAcademy.request.RegisterRequest;
import com.academy.MCAcademy.entity.ConfirmationToken;
import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.mailing.EmailSender;
import com.academy.MCAcademy.mailing.EmailValidator;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final EmailValidator emailValidator;

    private final ConfirmationTokenService confirmationTokenService;

    private final EmailSender emailSender;

    private final BuildEmailService buildEmailService;

    public AuthenticationResponse register(RegisterRequest request) {
        boolean isValidEmail = emailValidator.test(request.getEmail());
        if (!isValidEmail) {
            throw new IllegalStateException("Email not valid");
        }

//        if (request.getProfilePicture() == null) {
//            throw new IllegalStateException("Must have a profile picture!");
//        }

//        if (request.getProfilePicture().getType() == "video") {
//            throw new IllegalStateException("This file is not an image!");
//        }

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .dateOfBirth(request.getDateOfBirth())
                .email(request.getEmail())
                .password(request.getPassword())
                .description(request.getDescription())
                .profilePicture(request.getProfilePicture())
                .role(request.getRole())
                .build();

        if (user.getRole() == Role.ADMIN) {
            user.setStatus(Status.APPROVED);
        }
        else {
            user.setStatus(Status.PENDING);
        }

        String token = signUpUser(user);

        String subject = "Confirm your email";
        String name = request.getFirstname() + " " + request.getLastname();
        String body = "Thank you for registering. Please click on the below link to activate your account:";
        String link = "http://localhost:8080/api/v1/auth/confirm?token=" + token;
        String linkName = "Activate Now";
        String notice = "Link will expire in 15 minutes.";
        String signiture = "MC Academy Team!";

        emailSender.send(request.getEmail(),
                buildEmailService.buildEmail(subject, name, body, link, linkName, notice, signiture));

        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .build();
    }

    public String signUpUser(User user) {
        boolean userExists = userRepository.findByEmail(user.getEmail()).isPresent();
        if (userExists) {
            throw new IllegalStateException("Email already taken");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

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

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (user.getEnabled() != true) {
            throw new IllegalStateException("Email not confirmed. Please activate your account.");
        }

        if (user.getStatus() == Status.PENDING || user.getStatus() == Status.DECLINED) {
            throw new IllegalStateException("You don't have permission to authenticate!");
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .userId(user.getId())
                .token(jwtToken)
                .refreshToken(refreshToken)
                .role(user.getRole())
                .build();
    }

    @Transactional
    public String confirmToken(String token) {
        ConfirmationToken confirmationToken = confirmationTokenService
                .getToken(token)
                .orElseThrow(() -> new IllegalStateException("Token not found"));

        if (confirmationToken.getConfirmedAt() != null) {
            throw new IllegalStateException("Email already confirmed");
        }

        LocalDateTime expiredAt = confirmationToken.getExpiresAt();
        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expired");
        }

        confirmationTokenService.setConfirmedAt(token);
        userRepository.enableUser(confirmationToken.getUser().getEmail());

        return "confirmed";
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String username = jwtService.extractUsername(request.getRefreshToken());
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (!jwtService.isTokenValid(request.getRefreshToken(), user)) {
            throw new IllegalStateException("Refresh token expired. Please log in again.");
        }

        String newAccessToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .role(user.getRole())
                .build();
    }

}
