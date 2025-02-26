package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllLockedInstructors(Boolean locked, Boolean enable) {
        List<User> users = userRepository.findAllByRoleAndLockedAndEnabled(Role.INSTRUCTOR, locked, enable);
        users.forEach(user -> System.out.println("Instructor Email: " + user.getEmail()));
        return userRepository.findAllByRoleAndLockedAndEnabled(Role.INSTRUCTOR, locked, enable);
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));
    }
}
