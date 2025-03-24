package com.academy.MCAcademy.request;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.SpotifyTrack;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequest {

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private Instrument instrument;

    private Long instructorId;

    private SpotifyTrack spotifyTrack;

    private Set<File> images;

    private Set<File> videos;
}
