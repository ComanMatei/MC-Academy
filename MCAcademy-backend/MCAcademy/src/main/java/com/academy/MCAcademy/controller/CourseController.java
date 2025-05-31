package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.dto.CourseDto;
import com.academy.MCAcademy.dto.CourseFilesDto;
import com.academy.MCAcademy.dto.CourseSummaryDto;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.SpotifyTrack;
import com.academy.MCAcademy.request.AssignCoursesRequest;
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

    // Create course
    @PostMapping("/create-course")
    public ResponseEntity<CourseDto> createCourse(@RequestBody CourseDto dto) {
        CourseDto courseDto = courseService.createCourse(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(courseDto);
    }

    // Assign images and videos to course
    @PostMapping("/assign-files")
    public ResponseEntity<CourseDto> assignFiles(@RequestBody CourseFilesDto dto) {
        CourseDto courseDto = courseService.assignFilesToCourse(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(courseDto);
    }

    // Create spotify track for courses
    @PostMapping("/create-track")
    public ResponseEntity<SpotifyTrack> createTrack(@RequestBody SpotifyTrack track) {
        return ResponseEntity.ok(spotifyTrackService.createTrack(track));
    }

    // Return all the instructor courses based on instruments and isHistory
    @GetMapping("/{instructorId}/{isHistory}")
    public List<CourseSummaryDto> getAllCourses(@PathVariable Long instructorId,
                                                @PathVariable Boolean isHistory,
                                                @RequestParam Instrument instrument) {
        return courseService.getAllCourses(instructorId, instrument, isHistory);
    }

    // Assign courses to students
    @PostMapping("{instructorId}/assign-students")
    public ResponseEntity<String> assignCoursesStudents(@PathVariable Long instructorId,
                                                        @RequestBody AssignCoursesRequest request) {
        courseService.assignCoursesStudents(request);

        return ResponseEntity.ok("The courses has been assigned!");
    }

    // Marks a course as history if its end date has passed
    @PatchMapping("/mark-history/{courseId}")
    public ResponseEntity<CourseSummaryDto> markCourseAsHistory(@PathVariable Long instructorId,
                                                                @PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.markCourseAsHistory(courseId));
    }

    @PutMapping("/{instructorId}/update/{id}")
    public ResponseEntity<CourseDto> editCourse(@PathVariable Long instructorId, @PathVariable Long id,
                                                @RequestBody CourseDto dto) {
        return ResponseEntity.ok(courseService.editCourse(id, dto));
    }

    @DeleteMapping("/{instructorId}/delete/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok("Course deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }
}
