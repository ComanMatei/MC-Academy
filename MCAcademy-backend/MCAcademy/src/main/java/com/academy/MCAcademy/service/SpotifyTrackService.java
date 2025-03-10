package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.SpotifyTrack;
import com.academy.MCAcademy.repository.SpotifyTrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class SpotifyTrackService {

    @Autowired
    private final SpotifyTrackRepository spotifyTrackRepository;

    public SpotifyTrack createTrack(SpotifyTrack track) {
        SpotifyTrack spotifyTrack = SpotifyTrack
                .builder()
                .name(track.getName())
                .artist(track.getArtist())
                .spotifyUrl(track.getSpotifyUrl())
                .build();

        return spotifyTrackRepository.save(spotifyTrack);
    }
}
