package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.AssignStudent;
import com.academy.MCAcademy.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSpecValidationDto {
     private Boolean answer;
}
