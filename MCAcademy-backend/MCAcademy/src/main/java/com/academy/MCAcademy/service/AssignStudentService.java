package com.academy.MCAcademy.service;

import com.academy.MCAcademy.request.AssignStudentRequest;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.AssignStudentRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AssignStudentService {

    private final UserRepository userRepository;

    private final AssignStudentRepository assignStudentRepository;
    public AssignStudent assignStudent(Long studentId, AssignStudentRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

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

    public List<User> getAssignedStudents(Status status, Long instructorId, Instrument instrument) {
        List<AssignStudent> assignedStudents = assignStudentRepository.findAllByStatusAndInstructorSpec_Instructor_IdAndInstructorSpec_Instrument(
                status, instructorId, instrument);
        return assignedStudents.stream()
                .map(AssignStudent::getStudent)
                .collect(Collectors.toList());
    }

    public AssignStudent getAssign(Long studentId, Long instructorSpecId) {
        return assignStudentRepository.findByStudent_IdAndInstructorSpec_Id(studentId, instructorSpecId);
    }

    public List<InstructorSpecialization> getStudentSpecializations(Long studentId) {
        List<AssignStudent> studentAssignments = assignStudentRepository.findAllByStudent_IdAndStatus(studentId, Status.APPROVED);

        return studentAssignments.stream()
                .map(AssignStudent::getInstructorSpec)
                .collect(Collectors.toList());
    }
}
