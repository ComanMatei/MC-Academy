package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.AssignStudentRepository;
import com.academy.MCAcademy.request.AssignInstrumentRequest;
import com.academy.MCAcademy.repository.InstructorSpecializationRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstructorSpecializationService {

    private final UserRepository userRepository;

    private final InstructorSpecializationRepository instructorSpecializationRepository;

    public InstructorSpecialization assignInstrument(Long instructorId, AssignInstrumentRequest request) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("Only instructors can assign instruments for courses");
        }

        if (instructorSpecializationRepository.existsByInstructorAndInstrument(instructor, request.getInstrument())) {
            throw new RuntimeException("Instructor is already assigned to this instrument");
        }

        InstructorSpecialization instructorSpecialization = InstructorSpecialization
                .builder()
                .instructor(instructor)
                .instrument(request.getInstrument())
                .timeAssigned(LocalDate.now())
                .build();

        return instructorSpecializationRepository.save(instructorSpecialization);
    }

    public User getInstructor(String email) {
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("This user is not an instructor!");
        }

        return instructor;
    }

    public List<InstructorSpecialization> getAllInstructorSpec(Long instructorId) {
        return instructorSpecializationRepository.findAllByInstructorId(instructorId);
    }

    public List<String> getInstrInstruments(Long instructorId) {
        return instructorSpecializationRepository.findAllInstrumentByInstructorId(instructorId);
    }

    public InstructorSpecialization getInstructorSpec(Long instructorId, Instrument instrument) {
        return instructorSpecializationRepository.findByInstructorIdAndInstrument(instructorId, instrument);
    }
}
