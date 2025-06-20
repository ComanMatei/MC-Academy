package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.dto.AssignStudentDto;
import com.academy.MCAcademy.dto.CourseSummaryDto;
import com.academy.MCAcademy.dto.InstructorSpecDto;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.request.AssignStudentRequest;
import com.academy.MCAcademy.service.AssignStudentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final AssignStudentService assignStudentService;

    // Student assigning an instructor specialization
    @PostMapping("/{studentId}/assign-spec")
    public ResponseEntity<AssignStudentDto> assignStudentSpec(@PathVariable Long studentId,
                                                              @RequestBody AssignStudentRequest request) {
        return ResponseEntity.ok(assignStudentService.assignStudent(studentId, request));
    }

    // This functions finds all student specializations
    @GetMapping("/{studentId}/specializations")
    public ResponseEntity<List<InstructorSpecDto>> getStudentSpecializations(@PathVariable Long studentId) {
        return ResponseEntity.ok(assignStudentService.getStudentSpecializations(studentId));
    }

    // Return students assigned courses given by instrument and isHistory
    @GetMapping("/{studentId}/courses/{instructorId}/{isHistory}/{instrument}")
    public ResponseEntity<List<CourseSummaryDto>> getStudentCourses(@PathVariable Long studentId,
                                                                    @PathVariable Long instructorId,
                                                                    @PathVariable Boolean isHistory,
                                                                    @PathVariable Instrument instrument) {
        return ResponseEntity.ok(assignStudentService.getStudentCourses(studentId, instructorId, instrument, isHistory));
    }

    // Returns a list with instructor specialization based on instrument
    @GetMapping("/{studentId}/instructor-spec/{instrument}")
    public ResponseEntity<List<InstructorSpecDto>> getInstructorSpecs(@PathVariable Long studentId,
                                                                      @PathVariable Instrument instrument) {

        return ResponseEntity.ok(assignStudentService.getInstructorSpecsByInstrument(instrument));
    }
}
