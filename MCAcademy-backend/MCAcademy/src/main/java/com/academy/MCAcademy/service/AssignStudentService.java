package com.academy.MCAcademy.service;

import com.academy.MCAcademy.request.AssignStudentRequest;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.AssignStudentRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AssignStudentService {

    private final UserRepository userRepository;

    private final AssignStudentRepository assignStudentRepository;
    public AssignStudent assignStudent(Long studentId, AssignStudentRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("This user dosen't exist"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can assign to a specializations!");
        }

        if (assignStudentRepository.existsByStudentAndInstructorSpec(student, request.getInstructorSpec())) {
            throw new RuntimeException("You have already assigned to this instructor for this instrument!");
        }

        AssignStudent assignStudent = AssignStudent
                .builder()
                .student(student)
                .instructorSpec(request.getInstructorSpec())
                .status(request.getStatus())
                .build();

        return assignStudentRepository.save(assignStudent);
    }

    public User getStudent(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("This user is not an student!");
        }

        return student;
    }

    public List<AssignStudent> getAllAssignedStudent(Status status, Long instructorId, Instrument instrument) {
        return assignStudentRepository.findAllByStatusAndInstructorSpec_Instructor_IdAndInstructorSpec_Instrument(status,
                instructorId, instrument);
    }
}
