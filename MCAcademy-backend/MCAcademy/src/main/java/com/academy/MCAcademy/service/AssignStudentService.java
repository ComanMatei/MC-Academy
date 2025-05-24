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

    public AssignStudentDto assignStudent(Long studentId, AssignStudentRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can assign to a specializations!");
        }

        if (assignStudentRepository.existsByStudentAndInstructorSpec_Id(student, request.getInstructorSpecId())) {
            throw new AlreadyAssignedException("You have already assigned to this instructor for this instrument!");
        }

        InstructorSpecialization instructorSpecialization = instructorSpecializationRepository.findById(request.getInstructorSpecId())
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
        for(Course curs : courses) {
            System.out.println("Idul: " + curs.getId());
        }

        return courses.stream()
                .map(this::convertCourseSummaryEntityToDto)
                .collect(Collectors.toList());
    }


    // Private functions for converting Entity class to DTO class
    private AssignStudentDto convertAssignStudentEntityToDto(AssignStudent assignStudent) {
        modelMapper.typeMap(AssignStudent.class, AssignStudentDto.class).addMappings(mapper -> {
            mapper.map(src -> src.getStudent().getId(), AssignStudentDto::setUserId);
            mapper.map(src -> src.getStudent().getFirstname(), AssignStudentDto::setFirstname);
            mapper.map(src -> src.getStudent().getLastname(), AssignStudentDto::setLastname);
        });

        return modelMapper.map(assignStudent, AssignStudentDto.class);
    }

    private InstructorSpecDto convertInstructorSpecEntityToDto(InstructorSpecialization instructorSpecialization) {
        modelMapper.typeMap(InstructorSpecialization.class, InstructorSpecDto.class).addMappings(mapper -> {
            mapper.map(src -> src.getInstructor().getId(), InstructorSpecDto::setInstructorId);
            mapper.map(src -> src.getInstructor().getFirstname(), InstructorSpecDto::setFirstname);
            mapper.map(src -> src.getInstructor().getLastname(), InstructorSpecDto::setLastname);
        });

        return modelMapper.map(instructorSpecialization, InstructorSpecDto.class);
    }

    private CourseSummaryDto convertCourseSummaryEntityToDto(Course course) {
        return modelMapper.map(course, CourseSummaryDto.class);
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
}
