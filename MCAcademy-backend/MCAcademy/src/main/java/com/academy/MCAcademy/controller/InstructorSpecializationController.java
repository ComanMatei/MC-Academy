package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.request.AssignInstrumentRequest;
import com.academy.MCAcademy.request.ValidationRequest;
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
public class InstructorSpecializationController {

    private final InstructorSpecializationService instructorSpecializationService;

    private final StudentSpecValidationService studentSpecValidationService;

    private final AssignStudentService assignStudentService;

    @PostMapping("/assign/{instructorId}")
    public ResponseEntity<InstructorSpecialization> assignInstrument(@PathVariable Long instructorId,
                                                                     @RequestBody AssignInstrumentRequest request) {
        return ResponseEntity.ok(instructorSpecializationService.assignInstrument(instructorId, request));
    }

    @GetMapping("/{email}")
    public ResponseEntity<User> getInstructor(@PathVariable String email) {
        return ResponseEntity.ok(instructorSpecializationService.getInstructor(email));
    }

    @GetMapping("/instr-assign/{instructorId}")
    public List<InstructorSpecialization> getInstructor(@PathVariable Long instructorId) {
        return instructorSpecializationService.getAllInstructorSpec(instructorId);
    }

    @PostMapping("/validation/{instructorId}/{id}")
    public ResponseEntity<StudentSpecValidation> validateStudentSpec(@PathVariable Long instructorId,
                                                                     @PathVariable Long id,
                                                                     @RequestBody ValidationRequest request) {
        return ResponseEntity.ok(studentSpecValidationService.validateStudentSpec(instructorId, id, request));
    }

    @GetMapping("/assigning/{instructorId}/{status}")
    public List<AssignStudent> getAllStudents(@PathVariable Long instructorId,
                                                      @PathVariable Status status,
                                                      @RequestParam Instrument instrument) {
        return assignStudentService.getAllAssignedStudent(status, instructorId, instrument);
    }

    @GetMapping("/assigned/{instructorId}")
    public List<User> getAllAssignedStudent(@PathVariable Long instructorId,
                                                     @RequestParam Instrument instrument) {
        return assignStudentService.getAssignedStudents(Status.APPROVED, instructorId, instrument);
    }

    @GetMapping("/instruments/{instructorId}")
    public List<String> getIntrIntruments(@PathVariable Long instructorId) {
        return instructorSpecializationService.getInstrInstruments(instructorId);
    }

    // This finds instructor specialization to validate student course assign
    @GetMapping("/spec/{instructorId}/{instrument}")
    public ResponseEntity<InstructorSpecialization> getInstructorSpec(@PathVariable Long instructorId,
                                                                      @PathVariable Instrument instrument) {
        return ResponseEntity.ok(instructorSpecializationService.getInstructorSpec(instructorId, instrument));
    }

    @GetMapping("/instruments")
    public ResponseEntity<List<Instrument>> getAllInstruments() {
        return ResponseEntity.ok(instructorSpecializationService.getAllInstruments());
    }
}
