package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AssignStudentRepository extends JpaRepository<AssignStudent, Long> {

    List<AssignStudent> findAllByStatusAndInstructorSpec_Instructor_IdAndInstructorSpec_Instrument(Status status,
                                                                                                   Long instructorId,
                                                                                                   Instrument instrument);

    List<AssignStudent> findAllByStudent_IdAndStatus(Long studentId, Status status);

    boolean existsByStudentAndInstructorSpec_Id(User student, Long instructorSpecId);
}
