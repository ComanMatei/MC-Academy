package com.academy.MCAcademy.auth;

import com.academy.MCAcademy.entity.InstructorSpecialization;
import com.academy.MCAcademy.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignStudentRequest {
    private InstructorSpecialization instructorSpec;

    private Status status;
}
