package com.academy.MCAcademy.service;

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

    public StudentSpecValidation validateStudentSpec(Long instructorId, Long id, ValidationRequest request) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("Only instructors can validate students");
        }

        AssignStudent assignStudent = assignStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student assign was not found with this id!"));

        StudentSpecValidation studentValidation = StudentSpecValidation.builder()
                .instructor(instructor)
                .assignStudent(assignStudent)
                .answer(request.getAnswer())
                .build();

        if(request.getAnswer()) {
            assignStudent.setStatus(Status.APPROVED);
            assignStudentRepository.save(assignStudent);
        }
        else if (request.getAnswer() == false){
            assignStudent.setStatus(Status.DECLINED);
            assignStudentRepository.save(assignStudent);
        }
        else {
            throw new RuntimeException("Something este gresit!");
        }

        return studentValidationRepository.save(studentValidation);
    }
}
