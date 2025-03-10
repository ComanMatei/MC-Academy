package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.SpotifyTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpotifyTrackRepository extends JpaRepository<SpotifyTrack, Long> {
}
