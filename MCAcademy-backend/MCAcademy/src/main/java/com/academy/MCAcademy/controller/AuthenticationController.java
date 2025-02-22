package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.auth.AuthenticationRequest;
import com.academy.MCAcademy.auth.AuthenticationResponse;
import com.academy.MCAcademy.auth.RegisterRequest;
import com.academy.MCAcademy.service.AuthenticationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register (@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate (@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @GetMapping(path = "confirm")
    public ResponseEntity<String> confirmToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(authenticationService.confirmToken(token));
    }
}
