package com.academy.MCAcademy.config;

import com.academy.MCAcademy.entity.User;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.Map;
import java.util.function.Supplier;

@Component
public class StudentRequestAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private static final String PATH_PATTERN = "/api/v1/student/{studentId}/**";
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authenticationSupplier, RequestAuthorizationContext context) {
        String requestUri = context.getRequest().getRequestURI();

        Map<String, String> uriVariables = pathMatcher.extractUriTemplateVariables(PATH_PATTERN, requestUri);
        String userIdFromRequestUri = uriVariables.get("studentId");

        Authentication authentication = authenticationSupplier.get();
        User student = (User) authentication.getPrincipal();
        String userIdFromPrincipal = String.valueOf(student.getId());

        boolean hasStudentRole = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_STUDENT"));

        boolean userIdsMatch = userIdFromRequestUri != null && userIdFromRequestUri.equals(userIdFromPrincipal);

        return new AuthorizationDecision(hasStudentRole && userIdsMatch);
    }
}
