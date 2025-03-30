package com.academy.MCAcademy.service;

import com.academy.MCAcademy.mailing.EmailSender;
import com.academy.MCAcademy.request.ValidationRequest;
import com.academy.MCAcademy.entity.UserValidation;
import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.repository.UserValidationRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserValidationService {

    private final UserRepository userRepository;

    private final UserValidationRepository instructorValidationRepository;

    private final EmailSender emailSender;

    private final BuildEmailService buildEmailService;

    public UserValidation validateUser(Long adminId, Long userId, ValidationRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin doesn't exist"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Instructor doesn't exist"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can validate users account!");
        }

        UserValidation instructorValidation = UserValidation.builder()
                .admin(admin)
                .user(user)
                .answer(request.getAnswer())
                .build();

        // For email sender
        String subject = "Status account!";
        String name = user.getFirstname() + " " + user.getLastname();
        String link = "http://localhost:5173/login";
        String linkName = "Log In";
        String signiture = "MC Academy Team!";

        if(request.getAnswer()) {
            user.setStatus(Status.APPROVED);

            String body = "We are pleased to inform you that your account has been approved. " +
                          "You can now log in to your account:";
            emailSender.send(user.getEmail(),
                    buildEmailService.buildEmail(subject, name, body, link, linkName, "", signiture));

            userRepository.save(user);
        }
        else if (request.getAnswer() == false){
            user.setStatus(Status.DECLINED);

            String body = "We are sorry to inform you that your account has been declined. " +
                    "You don't have acces to log in!";
            emailSender.send(user.getEmail(),
                    buildEmailService.buildEmail(subject, name, body, "", "", "", signiture));

            userRepository.save(user);
        }
        else {
            throw new RuntimeException("Something is wrong!");
        }

        return instructorValidationRepository.save(instructorValidation);
    }

    public User getAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("This user is not an admin!");
        }

        return admin;
    }
}
