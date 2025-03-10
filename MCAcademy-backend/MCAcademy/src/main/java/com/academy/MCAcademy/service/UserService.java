package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllPendingInstructors(Status status, Boolean enable) {
        List<User> users = userRepository.findAllByRoleAndStatusAndEnabled(Role.INSTRUCTOR, status, enable);
        users.forEach(user -> System.out.println("Instructor Email: " + user.getEmail()));
        return userRepository.findAllByRoleAndStatusAndEnabled(Role.INSTRUCTOR, status, enable);
    }
}
