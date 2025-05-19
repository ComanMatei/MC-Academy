package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.dto.AssignStudentDto;
import com.academy.MCAcademy.dto.InstructorSpecDto;
import com.academy.MCAcademy.dto.StudentSpecValidationDto;
import com.academy.MCAcademy.dto.ValidatorDto;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.service.AssignStudentService;
import com.academy.MCAcademy.service.InstructorSpecializationService;
import com.academy.MCAcademy.service.StudentSpecValidationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/instructor")
@CrossOrigin(origins = "http://localhost:5173")
public class InstructorController {

    private final InstructorSpecializationService instructorSpecializationService;

    private final StudentSpecValidationService studentSpecValidationService;

    private final AssignStudentService assignStudentService;

    // Returns instrument assign to an instructor
    @PostMapping("/{instructorId}/assign")
    public ResponseEntity<InstructorSpecDto> assignInstrument(@PathVariable Long instructorId,
                                                                     @RequestBody InstructorSpecDto instructorSpecDto) {
        return ResponseEntity.ok(instructorSpecializationService.assignInstrument(instructorId, instructorSpecDto));
    }

    // Returns instructor ID based on given email
    @GetMapping("/{instructorId}/validator")
    public ResponseEntity<ValidatorDto> getStudentsValidatorById(@PathVariable Long instructorId) {
        return ResponseEntity.ok(instructorSpecializationService.getStudentsValidatorById(instructorId));
    }

    // Returns all instructor specializations based on instructor ID
    @GetMapping("/specs/{instructorId}")
    public List<InstructorSpecDto> getInstructorSpecs(@PathVariable Long instructorId) {
        return instructorSpecializationService.getAllInstructorSpec(instructorId);
    }

    // Return the validation from instructor to a student
    @PostMapping("/{instructorId}/validation/{id}")
    public ResponseEntity<StudentSpecValidationDto> validateStudentSpec(@PathVariable Long instructorId,
                                                                        @PathVariable Long id,
                                                                        @RequestBody StudentSpecValidationDto dto) {
        return ResponseEntity.ok(studentSpecValidationService.validateStudentSpec(instructorId, id, dto));
    }

    // Returns all students who want to assign to an instructor
    @GetMapping("/{instructorId}/assigned/{status}")
    public List<AssignStudentDto> getAllAssignedStudent(@PathVariable Long instructorId,
                                                        @PathVariable Status status,
                                                        @RequestParam Instrument instrument) {
        return assignStudentService.getAssignedStudents(status, instructorId, instrument);
    }

    @GetMapping("/{instructorId}/instruments")
    public List<String> getIntrIntruments(@PathVariable Long instructorId) {
        return instructorSpecializationService.getInstrInstruments(instructorId);
    }

    // This finds instructor specialization to validate student course assign
    @GetMapping("/{instructorId}/spec/{instrument}")
    public ResponseEntity<InstructorSpecialization> getInstructorSpec(@PathVariable Long instructorId,
                                                                      @PathVariable Instrument instrument) {
        return ResponseEntity.ok(instructorSpecializationService.getInstructorSpec(instructorId, instrument));
    }

    @GetMapping("/instruments")
    public ResponseEntity<List<Instrument>> getAllInstruments() {
        return ResponseEntity.ok(instructorSpecializationService.getAllInstruments());
    }
}
