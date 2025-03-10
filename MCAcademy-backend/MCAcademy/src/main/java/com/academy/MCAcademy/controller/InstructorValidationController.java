package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.request.ValidationRequest;
import com.academy.MCAcademy.entity.InstructorValidation;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.service.InstructorValidationService;
import com.academy.MCAcademy.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class InstructorValidationController {
    private final InstructorValidationService instructorValidationService;

    private final UserService userService;

    @PostMapping("/validation/{adminId}/{instructorId}")
    public ResponseEntity<InstructorValidation> validateInstructor(
            @PathVariable Long adminId,
            @PathVariable Long instructorId,
            @RequestBody ValidationRequest request) {
        return ResponseEntity.ok(instructorValidationService.validateInstructor(adminId, instructorId, request));
    }

    @GetMapping("/pendinginstructors")
    public List<User> getAllPendingInstructors() {
        return userService.getAllPendingInstructors(Status.PENDING, true);
    }

    @GetMapping("/{email}")
    public ResponseEntity<User> getAdmin(@PathVariable String email) {
        return ResponseEntity.ok(instructorValidationService.getAdmin(email));
    }
}
