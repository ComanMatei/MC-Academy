package com.academy.MCAcademy.controller;

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

    @GetMapping("/id/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email){
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/{role}/{status}")
    public List<User> getUserByEmail(@PathVariable Role role,
                                     @PathVariable Status status){
        return userService.getUsersByRole(role, status, true);
    }

    @PutMapping("/edit/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId,
                                           @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }
}
