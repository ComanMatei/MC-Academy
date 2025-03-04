package com.academy.MCAcademy.service;

import com.academy.MCAcademy.auth.ValidationRequest;
import com.academy.MCAcademy.entity.InstructorValidation;
import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.repository.InstructorValidationRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InstructorValidationService {

    private final UserRepository userRepository;

    private final InstructorValidationRepository instructorValidationRepository;

    public InstructorValidation validateInstructor(Long adminId, Long instructorId, ValidationRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin doesn't exist"));

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor doesn't exist"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can validate instructors");
        }

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("Only instructors can be validated!");
        }

        InstructorValidation instructorValidation = InstructorValidation.builder()
                .admin(admin)
                .instructor(instructor)
                .answer(request.getAnswer())
                .build();

        if(request.getAnswer()) {
            instructor.setStatus(Status.APPROVED);
            userRepository.save(instructor);
        }
        else if (request.getAnswer() == false){
            instructor.setStatus(Status.DECLINED);
            userRepository.save(instructor);
        }
        else {
            throw new RuntimeException("Something este gresit!");
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
