package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.SpotifyTrack;
import com.academy.MCAcademy.request.CourseRequest;
import com.academy.MCAcademy.service.CourseService;
import com.academy.MCAcademy.service.SpotifyTrackService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/course")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    @Autowired
    private final SpotifyTrackService spotifyTrackService;

    private final CourseService courseService;

    @PostMapping("/create-course")
    public ResponseEntity<Course> createCourse(@RequestBody CourseRequest request) {
        Course course = courseService.createCourse(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

    // Create Spotify track
    @PostMapping("/create-track")
    public ResponseEntity<SpotifyTrack> createTrack(@RequestBody SpotifyTrack track) {
        return ResponseEntity.ok(spotifyTrackService.createTrack(track));
    }
}
