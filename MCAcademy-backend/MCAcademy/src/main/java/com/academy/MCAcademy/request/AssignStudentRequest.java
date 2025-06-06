package com.academy.MCAcademy.request;

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

    private Long instructorSpecId;

    private Status status;
}
