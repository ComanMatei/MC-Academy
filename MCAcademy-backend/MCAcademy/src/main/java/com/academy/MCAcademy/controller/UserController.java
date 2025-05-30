package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.dto.CourseDto;
import com.academy.MCAcademy.dto.UserDto;
import com.academy.MCAcademy.dto.UserSummaryDto;
import com.academy.MCAcademy.dto.ValidatorDto;
import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.request.RegisterRequest;
import com.academy.MCAcademy.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    // Return user info based on given id
    @GetMapping("/info/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // Returns validator info based on given email
    @GetMapping("/validator/{userId}")
    public ResponseEntity<ValidatorDto> getUsersValidatorById(@PathVariable Long userId){
        return ResponseEntity.ok(userService.getUsersValidatorById(userId));
    }

    // Returns a list of users filtered by role, status, and if activation is true
    @GetMapping("/{role}/{status}")
    public List<UserSummaryDto> getUsersByRoleAndStatus(@PathVariable Role role,
                                                        @PathVariable Status status){
        return userService.getUsersByRoleAndStatus(role, status, true);
    }

    // Update user account
    @PutMapping("/edit/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long userId,
                                           @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @GetMapping("/{userId}/only/{id}")
    public ResponseEntity<CourseDto> getCourse(@PathVariable Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(userService.getCourse(id));
    }
}
