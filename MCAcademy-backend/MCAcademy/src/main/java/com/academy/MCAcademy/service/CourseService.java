package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.CourseRepository;
import com.academy.MCAcademy.repository.FileRepository;
import com.academy.MCAcademy.repository.SpotifyTrackRepository;
import com.academy.MCAcademy.repository.UserRepository;
import com.academy.MCAcademy.request.AssignCoursesRequest;
import com.academy.MCAcademy.request.CourseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    private final UserRepository userRepository;

    private final SpotifyTrackRepository spotifyTrackRepository;

    private final FileRepository fileRepository;

    public Course createCourse(CourseRequest request) {

        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("This user is not an instructor!");
        }

        Set<File> images = new HashSet<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            images = request.getImages();
        }

        Set<File> videos = new HashSet<>();
        if (request.getVideos() != null && !request.getVideos().isEmpty()) {
            videos = request.getVideos();
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

    public List<Course> getAllCourses(Long instructorId, Instrument instrument) {

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("This instructor doesn't exist"));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new RuntimeException("This user is not an instructor!");
        }

        return courseRepository.findAllCoursesByInstructorIdAndInstrument(instructorId, instrument);
    }

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

    public Course getCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("The course with this id doesn't exist!"));

        return course;
    }

    public List<Course> getStudentCourses(Long studentId, Long instructorId, Instrument instrument) {
        List<Course> courses = courseRepository.findAllByStudents_IdAndInstructor_IdAndInstrument(studentId,
                instructorId, instrument);
        for(Course curs : courses) {
            System.out.println("Idul: " + curs.getId());
        }
        return courses;
    }

    public Course editCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("The course with this id doesn't exist!"));

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            Set<File> newImages = request.getImages();

            if (course.getImages() == null) {
                course.setImages(newImages);
            } else {
                course.getImages().addAll(newImages);
            }
        }

        if (request.getVideos() != null && !request.getVideos().isEmpty()) {
            Set<File> newVideos = request.getVideos();

            if (course.getVideos() == null) {
                course.setVideos(newVideos);
            } else {
                course.getVideos().addAll(newVideos);
            }
        }

        if (request.getName() != null) {
            course.setName(request.getName());
        }
        if (request.getStartDate() != null) {
            course.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            course.setEndDate(request.getEndDate());
        }
        if (request.getInstrument() != null) {
            course.setInstrument(request.getInstrument());
        }
        if (request.getSpotifyTrack() != null) {
            course.setSpotifyTrack(request.getSpotifyTrack());
        }

        return courseRepository.save(course);
    }

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
}
