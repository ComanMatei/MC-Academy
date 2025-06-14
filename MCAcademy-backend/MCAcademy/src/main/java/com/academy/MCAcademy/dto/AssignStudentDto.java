package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignStudentDto {

    private Long id;

    private Long userId;

    private String firstname;

    private String lastname;

    private String description;

    private File profilePicture;

    private int age;

    private Status status;
}
