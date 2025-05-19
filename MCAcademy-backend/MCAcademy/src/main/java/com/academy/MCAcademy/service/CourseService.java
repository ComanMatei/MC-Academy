package com.academy.MCAcademy.service;

import com.academy.MCAcademy.dto.CourseDto;
import com.academy.MCAcademy.dto.CourseSummaryDto;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.CourseRepository;
import com.academy.MCAcademy.repository.FileRepository;
import com.academy.MCAcademy.repository.SpotifyTrackRepository;
import com.academy.MCAcademy.repository.UserRepository;
import com.academy.MCAcademy.request.AssignCoursesRequest;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final ModelMapper modelMapper;

    private final CourseRepository courseRepository;

    private final UserRepository userRepository;

    private final SpotifyTrackRepository spotifyTrackRepository;

    private final FileRepository fileRepository;

    // Create course
    public CourseDto createCourse(CourseDto dto) {

        User instructor = userRepository.findById(dto.getInstructorId())
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("This user is not an instructor!");
        }

        Set<File> images = new HashSet<>();
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            images = dto.getImages();
        }

        Set<File> videos = new HashSet<>();
        if (dto.getVideos() != null && !dto.getVideos().isEmpty()) {
            videos = dto.getVideos();
        }

        Course course = convertCourseDtoToEntity(dto, instructor, images, videos);

        Course savedCourse = courseRepository.save(course);

        return convertCourseEntityToDto(savedCourse);
    }

    // Return all the instructor courses based on instruments and isHistory
    public List<CourseSummaryDto> getAllCourses(Long instructorId, Instrument instrument, Boolean isHistory) {

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("This user is not an instructor!");
        }

        List<Course> courses = courseRepository.findAllCoursesByInstructorIdAndInstrumentAndIsHistory(instructorId,
                instrument, isHistory);

        return courses.stream()
                .map(this::convertCourseSummaryEntityToDto)
                .collect(Collectors.toList());
    }

    // Assign courses to students
    @Transactional
    public void assignCoursesStudents(AssignCoursesRequest request) {

        List<Course> courses = courseRepository.findAllById(request.getCourseIds());
        List<User> students = userRepository.findAllById(request.getStudentIds());

        for (Course course : courses) {
            for (User student : students) {
                if (!course.getStudents().contains(student)) {
                    course.getStudents().add(student);
                }
            }
        }

        courseRepository.saveAll(courses);
    }

    // Marks a course as history if its end date has passed
    public CourseSummaryDto markCourseAsHistory(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (LocalDate.now().isAfter(course.getEndDate()))
            course.setIsHistory(true);

        courseRepository.save(course);

        return convertCourseSummaryEntityToDto(course);
    }

    public CourseDto editCourse(Long id, CourseDto dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("The course with this id doesn't exist!"));

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            Set<File> newImages = dto.getImages();

            if (course.getImages() == null) {
                course.setImages(newImages);
            } else {
                course.getImages().addAll(newImages);
            }
        }

        if (dto.getVideos() != null && !dto.getVideos().isEmpty()) {
            Set<File> newVideos = dto.getVideos();

            if (course.getVideos() == null) {
                course.setVideos(newVideos);
            } else {
                course.getVideos().addAll(newVideos);
            }
        }

        if (dto.getName() != null) {
            course.setName(dto.getName());
        }
        if (dto.getStartDate() != null) {
            course.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            course.setEndDate(dto.getEndDate());
        }
        if (dto.getInstrument() != null) {
            course.setInstrument(dto.getInstrument());
        }
        if (dto.getSpotifyTrack() != null) {
            course.setSpotifyTrack(dto.getSpotifyTrack());
        }

        Course savedCourse = courseRepository.save(course);

        return convertCourseEntityToDto(savedCourse);
    }

    // Delete course based on its ID
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("The course with this id doesn't exist!"));

        List<User> students = course.getStudents();
        if (students != null) {
            students.clear();
        }

        Set<File> images = course.getImages();
        if (images != null) {
            course.setImages(null);
            images.forEach(file -> fileRepository.delete(file));
        }

        Set<File> videos = course.getVideos();
        if (videos != null) {
            course.setVideos(null);
            videos.forEach(file -> fileRepository.delete(file));
        }

        SpotifyTrack track = course.getSpotifyTrack();
        if (track != null) {
            course.setSpotifyTrack(null);
            spotifyTrackRepository.delete(track);
        }

        courseRepository.deleteById(id);
    }


    // Private functions for converting Entity class to DTO class
    private CourseDto convertCourseEntityToDto(Course course) {
        return modelMapper.map(course, CourseDto.class);
    }

    private CourseSummaryDto convertCourseSummaryEntityToDto(Course course) {
        return modelMapper.map(course, CourseSummaryDto.class);
    }

    // Private functions for converting DTO class to Entity class
    private Course convertCourseDtoToEntity(CourseDto dto, User instructor, Set<File> images, Set<File> videos) {
        return Course
                .builder()
                .name(dto.getName())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .isHistory(dto.getIsHistory())
                .instrument(dto.getInstrument())
                .instructor(instructor)
                .spotifyTrack(dto.getSpotifyTrack())
                .images(images)
                .videos(videos)
                .build();
    }
}
