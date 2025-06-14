package com.academy.MCAcademy.service;

import com.academy.MCAcademy.dto.*;
import com.academy.MCAcademy.exception.AlreadyAssignedException;
import com.academy.MCAcademy.repository.CourseRepository;
import com.academy.MCAcademy.repository.InstructorSpecializationRepository;
import com.academy.MCAcademy.request.AssignStudentRequest;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.AssignStudentRepository;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AssignStudentService {

    private final ModelMapper modelMapper;

    private final UserRepository userRepository;

    private final AssignStudentRepository assignStudentRepository;

    private final InstructorSpecializationRepository instructorSpecializationRepository;

    private final CourseRepository courseRepository;

    // Assigning a student to an instructor's specialization
    public AssignStudentDto assignStudent(Long studentId, AssignStudentRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can assign to specializations!");
        }

        if (assignStudentRepository.existsByStudentAndInstructorSpec_Id(student, request.getInstructorSpecId())) {
            throw new AlreadyAssignedException("You have already assigned to this instructor for this instrument!");
        }

        InstructorSpecialization instructorSpecialization = instructorSpecializationRepository
                .findById(request.getInstructorSpecId())
                .orElseThrow(() -> new RuntimeException("This doesn't exist!"));

        AssignStudent assignStudent = convertAssignStudentDtoToEntity(student, instructorSpecialization, request);

        assignStudentRepository.save(assignStudent);

        return convertAssignStudentEntityToDto(assignStudent);
    }

    // Returns all students who want to assign to an instructor
    public List<AssignStudentDto> getAssignedStudents(Status status, Long instructorId, Instrument instrument) {
        List<AssignStudent> assignedStudents = assignStudentRepository
                .findAllByStatusAndInstructorSpec_Instructor_IdAndInstructorSpec_Instrument(
                status, instructorId, instrument);
        return assignedStudents
                .stream()
                .map(this::convertAssignStudentEntityToDto)
                .collect(Collectors.toList());
    }

    public List<InstructorSpecDto> getStudentSpecializations(Long studentId) {
        List<AssignStudent> studentAssignments =
                assignStudentRepository.findAllByStudent_IdAndStatus(studentId, Status.APPROVED);

        return studentAssignments.stream()
                .map(AssignStudent::getInstructorSpec)
                .map(this::convertInstructorSpecEntityToDto)
                .collect(Collectors.toList());
    }

    // Return students assigned courses given by instrument and isHistory
    public List<CourseSummaryDto> getStudentCourses(Long studentId, Long instructorId,
                                                    Instrument instrument, Boolean isHistory) {
        List<Course> courses = courseRepository.findAllByStudents_IdAndInstructor_IdAndInstrumentAndIsHistory(studentId,
                instructorId, instrument, isHistory);

        return courses.stream()
                .map(this::convertCourseSummaryEntityToDto)
                .collect(Collectors.toList());
    }

    // Returns a list with instructor specialization based on instrument
    public List<InstructorSpecDto> getInstructorSpecsByInstrument(Instrument instrument) {
        List<InstructorSpecialization> instructorspecs = instructorSpecializationRepository
                .findAllByInstrument(instrument);

        return instructorspecs.stream()
                .map(this::convertInstructorSpecializationEntityToDto)
                .collect(Collectors.toList());
    }


    // Private functions for converting Entity class to DTO class
    private AssignStudentDto convertAssignStudentEntityToDto(AssignStudent assignStudent) {
        modelMapper.typeMap(AssignStudent.class, AssignStudentDto.class).addMappings(mapper -> {
            mapper.map(src -> src.getStudent().getId(), AssignStudentDto::setUserId);
            mapper.map(src -> src.getStudent().getFirstname(), AssignStudentDto::setFirstname);
            mapper.map(src -> src.getStudent().getLastname(), AssignStudentDto::setLastname);
            mapper.map(src -> src.getStudent().getDescription(), AssignStudentDto::setDescription);
            mapper.map(src -> src.getStudent().getProfilePicture(), AssignStudentDto::setProfilePicture);
        });

        AssignStudentDto dto = modelMapper.map(assignStudent, AssignStudentDto.class);
        dto.setAge(calculateAge(assignStudent.getStudent().getDateOfBirth()));

        return dto;
    }

    private InstructorSpecDto convertInstructorSpecEntityToDto(InstructorSpecialization instructorSpecialization) {
        modelMapper.typeMap(InstructorSpecialization.class, InstructorSpecDto.class).addMappings(mapper -> {
            mapper.map(src -> src.getInstructor().getId(), InstructorSpecDto::setInstructorId);
            mapper.map(src -> src.getInstructor().getFirstname(), InstructorSpecDto::setFirstname);
            mapper.map(src -> src.getInstructor().getLastname(), InstructorSpecDto::setLastname);
        });

        return modelMapper.map(instructorSpecialization, InstructorSpecDto.class);
    }

    private InstructorSpecDto convertInstructorSpecializationEntityToDto(InstructorSpecialization instructorSpecialization) {
        modelMapper.typeMap(InstructorSpecialization.class, InstructorSpecDto.class).addMappings(mapper -> {
            mapper.map(src -> src.getInstructor().getId(), InstructorSpecDto::setInstructorId);
            mapper.map(src -> src.getInstructor().getFirstname(), InstructorSpecDto::setFirstname);
            mapper.map(src -> src.getInstructor().getLastname(), InstructorSpecDto::setLastname);
            mapper.map(src -> src.getInstructor().getDescription(), InstructorSpecDto::setDescription);
            mapper.map(src -> src.getInstructor().getProfilePicture(), InstructorSpecDto::setProfilePicture);
        });

        InstructorSpecDto dto = modelMapper.map(instructorSpecialization, InstructorSpecDto.class);

        dto.setAge(calculateAge(instructorSpecialization.getInstructor().getDateOfBirth()));

        return dto;
    }

    private CourseSummaryDto convertCourseSummaryEntityToDto(Course course) {
        CourseSummaryDto dto = new CourseSummaryDto();
        dto.setId(course.getId());
        dto.setName(course.getName());
        dto.setStartDate(course.getStartDate());
        dto.setEndDate(course.getEndDate());

        dto.setImageCount(course.getImages() != null ? course.getImages().size() : 0);
        dto.setVideoCount(course.getVideos() != null ? course.getVideos().size() : 0);
        dto.setHasSpotifyTrack(course.getSpotifyTrack() != null);

        return dto;
    }


    // Private functions for converting DTO class to Entity class
    private AssignStudent convertAssignStudentDtoToEntity(User student,
                                                          InstructorSpecialization instructorSpecialization,
                                                          AssignStudentRequest request) {
        return AssignStudent
                .builder()
                .student(student)
                .instructorSpec(instructorSpecialization)
                .status(request.getStatus())
                .build();
    }

    private int calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            throw new IllegalArgumentException("Birth date cannot be null");
        }

        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
