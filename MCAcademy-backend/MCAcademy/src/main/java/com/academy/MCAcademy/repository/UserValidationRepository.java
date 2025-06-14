package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.entity.UserValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserValidationRepository extends JpaRepository<UserValidation, Long> {

    Optional<UserValidation> findByUserId(Long userId);
}
