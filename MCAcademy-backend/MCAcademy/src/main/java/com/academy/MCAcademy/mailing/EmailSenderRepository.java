package com.academy.MCAcademy.mailing;

public interface EmailSenderRepository {
    void send(String to, String email);
}
