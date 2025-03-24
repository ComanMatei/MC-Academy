package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAllCoursesByInstructorIdAndInstrument(Long instructorId, Instrument instrument);

}
