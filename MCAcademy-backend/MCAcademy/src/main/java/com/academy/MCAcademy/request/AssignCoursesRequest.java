package com.academy.MCAcademy.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignCoursesRequest {

    private List<Long> courseIds;

    private List<Long> studentIds;
}
