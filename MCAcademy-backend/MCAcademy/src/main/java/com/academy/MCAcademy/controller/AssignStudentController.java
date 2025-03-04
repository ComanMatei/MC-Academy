package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.auth.AssignStudentRequest;
import com.academy.MCAcademy.entity.AssignStudent;
import com.academy.MCAcademy.entity.InstructorSpecialization;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.service.AssignStudentService;
import com.academy.MCAcademy.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignStudentController {

    private final AssignStudentService assignStudentService;

    private final UserService userService;

    @PostMapping("/assign-spec/{studentId}")
    public ResponseEntity<AssignStudent> assignStudentSpec(@PathVariable Long studentId,
                                                           @RequestBody AssignStudentRequest request) {
        return ResponseEntity.ok(assignStudentService.assignStudent(studentId, request));
    }

    @GetMapping("/approved-instructors")
    public List<User> getAllApprovedInstructors() {
        return userService.getAllPendingInstructors(Status.APPROVED, true);
    }

    @GetMapping("/{email}")
    public ResponseEntity<User> getStudent(@PathVariable String email) {
        return ResponseEntity.ok(assignStudentService.getStudent(email));
    }
}
