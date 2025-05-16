package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorSpecDto {
    private Long id;

    private String instructorId;

    private String firstname;

    private String lastname;

    private Instrument instrument;

    private LocalDate timeAssigned;
}
