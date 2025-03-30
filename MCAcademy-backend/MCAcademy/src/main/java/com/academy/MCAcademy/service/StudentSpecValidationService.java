package com.academy.MCAcademy.service;

import com.academy.MCAcademy.mailing.EmailSender;
import com.academy.MCAcademy.request.ValidationRequest;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.AssignStudentRepository;
import com.academy.MCAcademy.repository.StudentSpecValidationRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class StudentSpecValidationService {

    private final UserRepository userRepository;

    private final AssignStudentRepository assignStudentRepository;

    private final StudentSpecValidationRepository studentValidationRepository;

    private final EmailSender emailSender;

    private final BuildEmailService buildEmailService;

    public StudentSpecValidation validateStudentSpec(Long instructorId, Long id, ValidationRequest request) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("Only instructors can validate students");
        }

        AssignStudent assignStudent = assignStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student assign was not found with this id!"));

        StudentSpecValidation studentValidation = StudentSpecValidation
                .builder()
                .instructor(instructor)
                .assignStudent(assignStudent)
                .answer(request.getAnswer())
                .build();

        String subject = "Status instrument assign!";
        String name = assignStudent.getStudent().getFirstname() + " " + assignStudent.getStudent().getLastname();
        String link = "http://localhost:5173/login";
        String linkName = "Log In";
        String signiture = "Thank you, " + instructor.getFirstname() + " " + instructor.getLastname();

        if(request.getAnswer()) {
            assignStudent.setStatus(Status.APPROVED);

            String body = "I am pleased to inform you that your "
                    + assignStudent.getInstructorSpec().getInstrument()
                    + " assign has been approved. "
                    + "You can now log in to your account:";
            emailSender.send(assignStudent.getStudent().getEmail(),
                    buildEmailService.buildEmail(subject, name, body, link, linkName, "", signiture));

            assignStudentRepository.save(assignStudent);
        }
        else if (request.getAnswer() == false){
            assignStudent.setStatus(Status.DECLINED);

            String body = "I am sorry to inform you that your "
                    + assignStudent.getInstructorSpec().getInstrument()
                    + " assign has been declined. "
                    + "Try to assign to another instructor";
            emailSender.send(assignStudent.getStudent().getEmail(),
                    buildEmailService.buildEmail(subject, name, body, link, linkName, "", signiture));

            assignStudentRepository.save(assignStudent);
        }
        else {
            throw new RuntimeException("Something is wrong!");
        }

        return studentValidationRepository.save(studentValidation);
    }
}
