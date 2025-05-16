package com.academy.MCAcademy.response;

import com.academy.MCAcademy.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    private Long userId;

    private String token;

    private String refreshToken;

    private Role role;
}
