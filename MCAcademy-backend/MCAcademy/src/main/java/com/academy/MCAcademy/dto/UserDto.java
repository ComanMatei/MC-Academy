package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long userId;

    private String firstname;

    private String lastname;

    private LocalDate dateOfBirth;

    private String email;

    private String description;

    private Role role;

    private File profilePicture;

    private Status status;

}
