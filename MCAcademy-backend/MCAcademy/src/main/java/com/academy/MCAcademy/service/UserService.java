package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.Role;
import com.academy.MCAcademy.entity.Status;
import com.academy.MCAcademy.entity.User;
import com.academy.MCAcademy.repository.UserRepository;
import com.academy.MCAcademy.request.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("The user with this id doesn't exist!"));

        return user;
    }

    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist"));

        return user;
    }

    public List<User> getAllPendingInstructors(Status status, Boolean enable) {
        List<User> users = userRepository.findAllByRoleAndStatusAndEnabled(Role.INSTRUCTOR, status, enable);
        users.forEach(user -> System.out.println("Instructor Email: " + user.getEmail()));
        return userRepository.findAllByRoleAndStatusAndEnabled(Role.INSTRUCTOR, status, enable);
    }

    public List<User> getUsersByRole(Role role, Status status, Boolean enable) {
        return userRepository.findAllByRoleAndStatusAndEnabled(role, status, enable);
    }

    public User updateUser(Long userId, RegisterRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist!"));

        if (request.getFirstname() != null) {
            user.setFirstname(request.getFirstname());
        }
        if (request.getLastname() != null) {
            user.setLastname(request.getLastname());
        }
        if (request.getDescription() != null) {
            user.setDescription(request.getDescription());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        return userRepository.save(user);
    }
}
