package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.SpotifyTrack;
import com.academy.MCAcademy.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {

    private Long id;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isHistory;

    private Instrument instrument;

    private Long instructorId;

    private SpotifyTrack spotifyTrack;

    private Set<File> images;

    private Set<File> videos;
}
