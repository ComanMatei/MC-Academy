package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignStudentRepository extends JpaRepository<AssignStudent, Long> {

    List<AssignStudent> findAllByStatusAndInstructorSpec_Instructor_IdAndInstructorSpec_Instrument(Status status,
                                                                                                   Long instructorId,
                                                                                                   Instrument instrument);

    List<AssignStudent> findAllByStudent_IdAndStatus(Long studentId, Status status);

    AssignStudent findByStudent_IdAndInstructorSpec_Id(Long studentId, Long instructorSpecId);
    boolean existsByStudentAndInstructorSpec(User student, InstructorSpecialization instructorSpec);
}
