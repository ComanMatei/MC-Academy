package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.auth.EmailRequest;
import com.academy.MCAcademy.auth.ResetPasswordRequest;
import com.academy.MCAcademy.service.ForgotPasswordService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/forgotpassword")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/request")
    public ResponseEntity<String> requestReset(@RequestBody EmailRequest request) {
        return ResponseEntity.ok(forgotPasswordService.verifyEmail(request.getEmail()));
    }

    @GetMapping(path = "reset")
    public ResponseEntity<String> confirmToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(forgotPasswordService.confirmToken(token));
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestParam("token") String token, @RequestBody ResetPasswordRequest request) {
        ResponseEntity.ok(forgotPasswordService.resetPassword(token, request.getNewPassword(), request.getRepetPassword()));
        return ResponseEntity.ok("Parola a fost resetată cu succes!");
    }

}
