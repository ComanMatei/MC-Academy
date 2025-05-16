package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidatorDto {
    private Long id;

    private Role role;
}
