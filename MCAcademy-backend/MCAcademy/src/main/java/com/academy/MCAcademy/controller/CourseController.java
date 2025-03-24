package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.SpotifyTrack;
import com.academy.MCAcademy.request.AssignCoursesRequest;
import com.academy.MCAcademy.request.CourseRequest;
import com.academy.MCAcademy.service.CourseService;
import com.academy.MCAcademy.service.SpotifyTrackService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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

    @PostMapping("/create-track")
    public ResponseEntity<SpotifyTrack> createTrack(@RequestBody SpotifyTrack track) {
        return ResponseEntity.ok(spotifyTrackService.createTrack(track));
    }

    @GetMapping("/{instructorId}")
    public List<Course> getAllCourses(@PathVariable Long instructorId,
                                      @RequestParam Instrument instrument) {
        return courseService.getAllCourses(instructorId, instrument);
    }

    @PostMapping("/assign-students")
    public ResponseEntity<String> assignCoursesStudents(@RequestBody AssignCoursesRequest request) {
        courseService.assignCoursesStudents(request);

        return ResponseEntity.ok("The courses has been assigned!");
    }

    @GetMapping("/only/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourse(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Course> editCourse(@PathVariable Long id,
                                               @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.editCourse(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok("Course deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }
}
