package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.auth.EmailRequest;
import com.academy.MCAcademy.auth.EmailResponse;
import com.academy.MCAcademy.auth.ResetPasswordRequest;
import com.academy.MCAcademy.service.ForgotPasswordService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/forgotpassword")
@CrossOrigin(origins = "http://localhost:5173")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/request")
    public ResponseEntity<EmailResponse> requestReset(@RequestBody EmailRequest request) {
        return ResponseEntity.ok(forgotPasswordService.verifyEmail(request));
    }

    @GetMapping(path = "reset")
    public ResponseEntity<String> confirmToken(@RequestParam("token") String token) {
        String response = forgotPasswordService.confirmToken(token);

        if (response.equals("confirmed")) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("http://localhost:5173/forgotpassword/reset?token=" + token));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @PostMapping("reset")
    public ResponseEntity<String> resetPassword(@RequestParam("token") String token, @RequestBody ResetPasswordRequest request) {
        ResponseEntity.ok(forgotPasswordService.resetPassword(token, request));
        return ResponseEntity.ok("Parola a fost resetată cu succes!");
    }

}
