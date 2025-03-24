package com.academy.MCAcademy.request;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstname;
    private String lastname;
    private LocalDate dateOfBirth;
    private String email;
    private String password;
    private String description;
    private File profilePicture;
    private Boolean locked;
    private Role role;
}
