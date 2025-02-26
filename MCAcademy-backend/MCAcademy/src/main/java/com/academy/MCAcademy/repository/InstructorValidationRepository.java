package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.InstructorValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstructorValidationRepository extends JpaRepository<InstructorValidation, Long> {

}
