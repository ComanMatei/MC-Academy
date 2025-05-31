package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.File;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseFilesDto {

    private Long courseId;

    private Set<File> images;

    private Set<File> videos;
}
