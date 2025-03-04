package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.InstructorSpecialization;
import com.academy.MCAcademy.entity.Instrument;
import com.academy.MCAcademy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InstructorSpecializationRepository extends JpaRepository<InstructorSpecialization, Long> {
    boolean existsByInstructorAndInstrument(User instructor, Instrument instrument);
    List<InstructorSpecialization> findAllByInstructorId(Long intructorid);

    @Query("SELECT i.instrument FROM InstructorSpecialization i WHERE i.instructor.id = :instructorId")
    List<String> findAllInstrumentByInstructorId(@Param("instructorId") Long instructorId);
}
