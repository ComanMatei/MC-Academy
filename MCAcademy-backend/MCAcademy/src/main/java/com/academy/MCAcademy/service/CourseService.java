package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.repository.CourseRepository;
import com.academy.MCAcademy.repository.UserRepository;
import com.academy.MCAcademy.request.CourseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    private final FileService fileService;

    private final UserRepository userRepository;

    public Course createCourse(CourseRequest request) {

        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("This user is not an instructor!");
        }

        List<File> images = List.of();
        if (request.getImageIds() != null && !request.getImageIds().isEmpty()) {
            images = fileService.getFilesByIds(request.getImageIds(), "image");
        }

        List<File> videos = List.of();
        if (request.getVideoIds() != null && !request.getVideoIds().isEmpty()) {
            videos = fileService.getFilesByIds(request.getVideoIds(), "video");
        }

        Course newCourse = Course
                .builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .instrument(request.getInstrument())
                .instructor(instructor)
                .spotifyTrack(request.getSpotifyTrack())
                .images(images)
                .videos(videos)
                .build();

        return courseRepository.save(newCourse);
    }

}
