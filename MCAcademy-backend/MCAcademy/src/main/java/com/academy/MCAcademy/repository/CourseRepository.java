package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.dto.CourseDto;
import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAllCoursesByInstructorIdAndInstrumentAndIsHistory(Long instructorId,
                                                                        Instrument instrument,
                                                                        Boolean isHistory);

    List<Course> findAllByStudents_IdAndInstructor_IdAndInstrumentAndIsHistory(Long studentId,
                                                                   Long instructorId,
                                                                   Instrument instrument,
                                                                   Boolean isHistory);

    Optional<Course> findByNameAndInstrumentAndInstructorId(String name, Instrument instrument, Long instructorId);

}
