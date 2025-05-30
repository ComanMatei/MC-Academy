package com.academy.MCAcademy.service;

import com.academy.MCAcademy.dto.InstructorSpecDto;
import com.academy.MCAcademy.dto.ValidatorDto;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.InstructorSpecializationRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorSpecializationService {

    private final ModelMapper modelMapper;

    private final UserRepository userRepository;

    private final InstructorSpecializationRepository instructorSpecializationRepository;

    // Creates instructor instrument assign
    public InstructorSpecDto assignInstrument(Long instructorId, InstructorSpecDto dto) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new IllegalStateException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new IllegalStateException("Only instructors can assign instruments for courses!");
        }

        if (instructorSpecializationRepository.existsByInstructorAndInstrument(instructor, dto.getInstrument())) {
            throw new IllegalStateException("You already assigned to this instrument!");
        }

        InstructorSpecialization instructorSpecialization = convertInstructorSpecializationDtoToEntity(dto, instructor);

        InstructorSpecialization savedSpecialization = instructorSpecializationRepository.save(instructorSpecialization);

        return convertInstructorSpecEntityToDto(savedSpecialization);
    }

    // Returns students validator info based on given ID
    public ValidatorDto getStudentsValidatorById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("This validator with this email doesn't exist!"));

        return convertValidatorEntityToDto(user);
    }

    // Returns all instructor specializations based on instructor ID
    public List<InstructorSpecDto> getAllInstructorSpec(Long instructorId) {
        List<InstructorSpecialization> instructorSpecializations = instructorSpecializationRepository
                .findAllByInstructorId(instructorId);
        return instructorSpecializations.stream()
                .map(this::convertInstructorSpecEntityToDto)
                .collect(Collectors.toList());
    }

    public List<String> getInstrInstruments(Long instructorId) {
        return instructorSpecializationRepository.findAllInstrumentByInstructorId(instructorId);
    }

    public InstructorSpecialization getInstructorSpec(Long instructorId, Instrument instrument) {
        return instructorSpecializationRepository.findByInstructorIdAndInstrument(instructorId, instrument);
    }

    public List<Instrument> getAllInstruments() {
        return Arrays.asList(Instrument.values());
    }


    // Private functions for converting Entity class to DTO class
    private ValidatorDto convertValidatorEntityToDto(User user) {
        return modelMapper.map(user, ValidatorDto.class);
    }

    private InstructorSpecDto convertInstructorSpecEntityToDto(InstructorSpecialization instructorSpecialization) {
        return modelMapper.map(instructorSpecialization, InstructorSpecDto.class);
    }

    // Private functions for converting DTO class to Entity class
    private InstructorSpecialization convertInstructorSpecializationDtoToEntity(InstructorSpecDto dto, User instructor) {
        return InstructorSpecialization
                .builder()
                .instructor(instructor)
                .instrument(dto.getInstrument())
                .timeAssigned(LocalDate.now())
                .build();
    }
}
