package com.academy.MCAcademy.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    private final AuthenticationProvider authenticationProvider;

    private final UserRequestAuthorizationManager userRequestAuthorizationManager;

    private final InstructorRequestAuthorizationManager instructorRequestAuthorizationManager;

    private final StudentRequestAuthorizationManager studentRequestAuthorizationManager;

    private final AdminRequestAuthorizationManager adminRequestAuthorizationManager;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/api/v1/forgotpassword/**", "/api/v1/file/profile-pic").permitAll()
                        .requestMatchers("/api/v1/user/edit/{userId}", "/api/v1/user/{role}/{status}", "/api/v1/instructor/specs/{instructorId}").authenticated()
                        .requestMatchers("/api/v1/user/**").access(this.userRequestAuthorizationManager)
                        .requestMatchers("/api/v1/admin/**").access(this.adminRequestAuthorizationManager)
                        .requestMatchers("/api/v1/course/**").access(this.instructorRequestAuthorizationManager)
                        .requestMatchers("/api/v1/instructor/**").access(this.instructorRequestAuthorizationManager)
                        .requestMatchers("/api/v1/student/**").access(this.studentRequestAuthorizationManager)
                        .requestMatchers("/api/v1/file/**").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
