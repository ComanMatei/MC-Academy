package com.academy.MCAcademy.dto;

import com.academy.MCAcademy.entity.Instrument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSummaryDto {
    private Long id;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isHistory;

    private Instrument instrument;

    private int imageCount;

    private int videoCount;

    private Boolean hasSpotifyTrack;
}
