package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.request.ValidationRequest;
import com.academy.MCAcademy.entity.UserValidation;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.service.UserValidationService;
import com.academy.MCAcademy.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class UserValidationController {

    private final UserValidationService instructorValidationService;


    @PostMapping("/validation/{adminId}/{userId}")
    public ResponseEntity<UserValidation> validateInstructor(
            @PathVariable Long adminId,
            @PathVariable Long userId,
            @RequestBody ValidationRequest request) {
        return ResponseEntity.ok(instructorValidationService.validateUser(adminId, userId, request));
    }

    @GetMapping("/{email}")
    public ResponseEntity<User> getAdmin(@PathVariable String email) {
        return ResponseEntity.ok(instructorValidationService.getAdmin(email));
    }
}
