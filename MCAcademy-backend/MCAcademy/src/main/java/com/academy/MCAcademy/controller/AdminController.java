package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.request.ValidationRequest;
import com.academy.MCAcademy.entity.UserValidation;
import com.academy.MCAcademy.service.UserValidationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserValidationService instructorValidationService;

    @PostMapping("/{adminId}/validation/{userId}")
    public ResponseEntity<UserValidation> validateUser(
            @PathVariable Long adminId,
            @PathVariable Long userId,
            @RequestBody ValidationRequest request) {
        return ResponseEntity.ok(instructorValidationService.validateUser(adminId, userId, request));
    }
}
