package com.academy.MCAcademy.exception;

public class AuthForbiddenException extends RuntimeException{

    public AuthForbiddenException(String message) {
        super(message);
    }
}
