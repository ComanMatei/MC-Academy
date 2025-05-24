package com.academy.MCAcademy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.authentication.BadCredentialsException;

import java.net.ConnectException;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIlegalStateException(IllegalStateException exception) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                exception.getMessage(),
                "Bad Request"
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AlreadyAssignedException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyAssigned(AlreadyAssignedException ex) {
        return new ResponseEntity<>(
                new ErrorResponse(LocalDateTime.now(), ex.getMessage(), "Duplicate assignment"),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(AuthForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AuthForbiddenException ex) {
        ErrorResponse error = new ErrorResponse(LocalDateTime.now(), ex.getMessage(), "Forbidden");
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse error = new ErrorResponse(LocalDateTime.now(), ex.getMessage(), "Unauthorized");
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MailSendException.class)
    public ResponseEntity<ErrorResponse> handleConnectException(MailSendException ex) {
        ErrorResponse error = new ErrorResponse(LocalDateTime.now(), ex.getMessage(), "Mail server unavailable");
        return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
