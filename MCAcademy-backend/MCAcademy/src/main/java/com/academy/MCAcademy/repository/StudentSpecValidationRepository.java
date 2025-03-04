package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.StudentSpecValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSpecValidationRepository extends JpaRepository<StudentSpecValidation, Long> {

}
