package com.academy.MCAcademy.service;

import com.academy.MCAcademy.dto.StudentSpecValidationDto;
import com.academy.MCAcademy.mailing.EmailSenderRepository;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.AssignStudentRepository;
import com.academy.MCAcademy.repository.StudentSpecValidationRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class StudentSpecValidationService {

    private final ModelMapper modelMapper;

    private final UserRepository userRepository;

    private final AssignStudentRepository assignStudentRepository;

    private final StudentSpecValidationRepository studentValidationRepository;

    private final EmailSenderRepository emailSender;

    private final BuildEmailService buildEmailService;

    @Transactional
    public StudentSpecValidationDto validateStudentSpec(Long instructorId, Long id,
                                                        StudentSpecValidationDto dto) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("Only instructors can validate students");
        }

        AssignStudent assignStudent = assignStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student assign was not found with this id!"));

        Optional<StudentSpecValidation> existingStudentValidationOpt = studentValidationRepository
                .findByAssignStudentId(assignStudent.getId());

        StudentSpecValidation studentSpecValidation;

        if (existingStudentValidationOpt.isPresent()) {
            studentSpecValidation = existingStudentValidationOpt.get();

            if (studentSpecValidation.getAnswer().equals(dto.getAnswer())) {
                if (dto.getAnswer())
                    throw new IllegalStateException("This student has already been approved");
                else
                    throw new IllegalStateException("This student has already been declined");
            }

            studentSpecValidation.setAnswer(dto.getAnswer());
        } else {
            studentSpecValidation = convertStudentSpecValidationDtoToEntity(assignStudent, dto);
        }

        String subject = "Status instrument assign!";
        String name = assignStudent.getStudent().getFirstname() + " " + assignStudent.getStudent().getLastname();
        String link = "http://localhost:5173/login";
        String linkName = "Log In";
        String signature = "Thank you, " + instructor.getFirstname() + " " + instructor.getLastname();

        if (dto.getAnswer() == true) {
            assignStudent.setStatus(Status.APPROVED);

            assignStudentRepository.save(assignStudent);
            assignStudentRepository.flush();
            String body = "I am pleased to inform you that your "
                    + assignStudent.getInstructorSpec().getInstrument()
                    + " assign has been approved. "
                    + "You can now log in to your account:";

            emailSender.send(assignStudent.getStudent().getEmail(),
                    buildEmailService.buildEmail(subject, name, body, link, linkName, "", signature));
        } else if (dto.getAnswer() == false) {
            assignStudent.setStatus(Status.DECLINED);

            assignStudentRepository.save(assignStudent);
            assignStudentRepository.flush();
            String body = "I am sorry to inform you that your "
                    + assignStudent.getInstructorSpec().getInstrument()
                    + " assign has been declined. Try to assign to another instructor";

            emailSender.send(assignStudent.getStudent().getEmail(),
                    buildEmailService.buildEmail(subject, name, body, link, linkName, "", signature));
        } else {
            throw new RuntimeException("Something is wrong!");
        }

        studentValidationRepository.save(studentSpecValidation);

        return convertStudentSpecValidationEntityToDto(studentSpecValidation);
    }


    // Private functions for converting Entity class to DTO class
    private StudentSpecValidationDto convertStudentSpecValidationEntityToDto(StudentSpecValidation studentSpecValidation) {
        return modelMapper.map(studentSpecValidation, StudentSpecValidationDto.class);
    }


    // Private functions for converting DTO class to Entity class
    private StudentSpecValidation convertStudentSpecValidationDtoToEntity(AssignStudent assignStudent,
                                                                          StudentSpecValidationDto dto) {
        return StudentSpecValidation
                .builder()
                .assignStudent(assignStudent)
                .answer(dto.getAnswer())
                .build();
    }
}
