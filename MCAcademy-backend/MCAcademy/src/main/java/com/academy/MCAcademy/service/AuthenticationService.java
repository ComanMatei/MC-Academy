package com.academy.MCAcademy.service;

import com.academy.MCAcademy.request.AuthenticationRequest;
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

        String link = "http://localhost:8080/api/v1/auth/confirm?token=" + token;
        emailSender.send(request.getEmail(), buildEmail(request.getFirstname(), link));

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

        return AuthenticationResponse.builder()
                .token(jwtToken)
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

    private String buildEmail(String name, String link) {
        return "<div style=\"font-family:Helvetica,Arial,sans-serif;font-size:16px;margin:0;color:#0b0c0c\">\n" +
                "\n" +
                "<span style=\"display:none;font-size:1px;color:#fff;max-height:0\"></span>\n" +
                "\n" +
                "  <table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;min-width:100%;width:100%!important\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
                "    <tbody><tr>\n" +
                "      <td width=\"100%\" height=\"53\" bgcolor=\"#0b0c0c\">\n" +
                "        \n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;max-width:580px\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\">\n" +
                "          <tbody><tr>\n" +
                "            <td width=\"70\" bgcolor=\"#0b0c0c\" valign=\"middle\">\n" +
                "                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse\">\n" +
                "                  <tbody><tr>\n" +
                "                    <td style=\"padding-left:10px\">\n" +
                "                  \n" +
                "                    </td>\n" +
                "                    <td style=\"font-size:28px;line-height:1.315789474;Margin-top:4px;padding-left:10px\">\n" +
                "                      <span style=\"font-family:Helvetica,Arial,sans-serif;font-weight:700;color:#ffffff;text-decoration:none;vertical-align:top;display:inline-block\">Confirm your email</span>\n" +
                "                    </td>\n" +
                "                  </tr>\n" +
                "                </tbody></table>\n" +
                "              </a>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </tbody></table>\n" +
                "        \n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </tbody></table>\n" +
                "  <table role=\"presentation\" class=\"m_-6186904992287805515content\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;max-width:580px;width:100%!important\" width=\"100%\">\n" +
                "    <tbody><tr>\n" +
                "      <td width=\"10\" height=\"10\" valign=\"middle\"></td>\n" +
                "      <td>\n" +
                "        \n" +
                "                <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse\">\n" +
                "                  <tbody><tr>\n" +
                "                    <td bgcolor=\"#1D70B8\" width=\"100%\" height=\"10\"></td>\n" +
                "                  </tr>\n" +
                "                </tbody></table>\n" +
                "        \n" +
                "      </td>\n" +
                "      <td width=\"10\" valign=\"middle\" height=\"10\"></td>\n" +
                "    </tr>\n" +
                "  </tbody></table>\n" +
                "\n" +
                "\n" +
                "\n" +
                "  <table role=\"presentation\" class=\"m_-6186904992287805515content\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;max-width:580px;width:100%!important\" width=\"100%\">\n" +
                "    <tbody><tr>\n" +
                "      <td height=\"30\"><br></td>\n" +
                "    </tr>\n" +
                "    <tr>\n" +
                "      <td width=\"10\" valign=\"middle\"><br></td>\n" +
                "      <td style=\"font-family:Helvetica,Arial,sans-serif;font-size:19px;line-height:1.315789474;max-width:560px\">\n" +
                "        \n" +
                "            <p style=\"Margin:0 0 20px 0;font-size:19px;line-height:25px;color:#0b0c0c\">Hi " + name + ",</p><p style=\"Margin:0 0 20px 0;font-size:19px;line-height:25px;color:#0b0c0c\"> Thank you for registering. Please click on the below link to activate your account: </p><blockquote style=\"Margin:0 0 20px 0;border-left:10px solid #b1b4b6;padding:15px 0 0.1px 15px;font-size:19px;line-height:25px\"><p style=\"Margin:0 0 20px 0;font-size:19px;line-height:25px;color:#0b0c0c\"> <a href=\"" + link + "\">Activate Now</a> </p></blockquote>\n Link will expire in 15 minutes. <p>See you soon</p>" +
                "        \n" +
                "      </td>\n" +
                "      <td width=\"10\" valign=\"middle\"><br></td>\n" +
                "    </tr>\n" +
                "    <tr>\n" +
                "      <td height=\"30\"><br></td>\n" +
                "    </tr>\n" +
                "  </tbody></table><div class=\"yj6qo\"></div><div class=\"adL\">\n" +
                "\n" +
                "</div></div>";
    }

}
