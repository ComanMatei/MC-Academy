package com.academy.MCAcademy.service;

import com.academy.MCAcademy.dto.CourseDto;
import com.academy.MCAcademy.dto.UserDto;
import com.academy.MCAcademy.dto.UserSummaryDto;
import com.academy.MCAcademy.dto.ValidatorDto;
import com.academy.MCAcademy.entity.*;
import com.academy.MCAcademy.repository.CourseRepository;
import com.academy.MCAcademy.repository.UserRepository;
import com.academy.MCAcademy.request.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final ModelMapper modelMapper;

    private final UserRepository userRepository;

    private final CourseRepository courseRepository;

    // Returns user info based on given ID
    public UserDto getUserById(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User principal = (User) authentication.getPrincipal();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        boolean isSameUser = principal.getId().equals(userId);

        if (!isAdmin && !isSameUser) {
            throw new AccessDeniedException("You do not have permission to access this user.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("The user with this id doesn't exist!"));

        return convertUserEntityToDto(user);
    }

    // Returns user validator info based on given ID
    public ValidatorDto getUsersValidatorById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("This validator with this email doesn't exist!"));

        return convertValidatorEntityToDto(user);
    }

    public List<UserSummaryDto> getUsersByRoleAndStatus(Role role, Status status, Boolean enable) {
        List<User> users = userRepository.findAllByRoleAndStatusAndEnabled(role, status, enable);
        return users.stream()
                .map(this::convertUserSummaryEntityToDto)
                .collect(Collectors.toList());
    }

    public UserDto updateUser(Long userId, RegisterRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("This user doesn't exist!"));

        Boolean updated = false;

        if (request.getFirstname() != null && !request.getFirstname().equals(user.getFirstname())) {
            user.setFirstname(request.getFirstname());
            updated = true;
        }
        if (request.getLastname() != null && !request.getLastname().equals(user.getLastname())) {
            user.setLastname(request.getLastname());
            updated = true;
        }
        if (request.getDescription() != null && !request.getDescription().equals(user.getDescription())) {
            user.setDescription(request.getDescription());
            updated = true;
        }
        if (request.getProfilePicture() != null && !request.getProfilePicture().equals(user.getProfilePicture())) {
            user.setProfilePicture(request.getProfilePicture());
            updated = true;
        }

        if (!updated) {
            throw new IllegalStateException("No changes detected!");
        }

        User updatedUser = userRepository.save(user);
        return convertUserEntityToDto(updatedUser);
    }

    public List<Instrument> getAllInstruments() {
        return Arrays.asList(Instrument.values());
    }

    public CourseDto getCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("The course with this id doesn't exist!"));

        boolean isInstructor = course.getInstructor().getId().equals(userId);

        boolean isStudentAssigned = course.getStudents().stream()
                .anyMatch(student -> student.getId().equals(userId));

        if (!isInstructor && !isStudentAssigned) {
            throw new AccessDeniedException("You do not have permission to access this course.");
        }

        return convertCourseEntityToDto(course);
    }


    // Private functions for converting Entity class to DTO class
    private ValidatorDto convertValidatorEntityToDto(User user) {
        ValidatorDto validatorDto = modelMapper.map(user, ValidatorDto.class);

        return validatorDto;
    }

    private CourseDto convertCourseEntityToDto(Course course) {
        return modelMapper.map(course, CourseDto.class);
    }


    private UserDto convertUserEntityToDto(User user) {
        UserDto userDto = modelMapper.map(user, UserDto.class);

        return userDto;
    }

    private UserSummaryDto convertUserSummaryEntityToDto(User user) {
        UserSummaryDto userSummaryDto = modelMapper.map(user, UserSummaryDto.class);

        return userSummaryDto;
    }
}
