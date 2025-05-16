package com.academy.MCAcademy.config;

import com.academy.MCAcademy.entity.User;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.util.UriTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Component
public class InstructorRequestAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private static final List<String> PATH_PATTERNS = Arrays.asList(
            "/api/v1/instructor/instruments",
            "/api/v1/instructor/{instructorId}/**",
            "/api/v1/course/create-course",
            "/api/v1/course/create-track",
            "/api/v1/course/mark-history/{courseId}",
            "/api/v1/course/{instructorId}/**"
    );

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authenticationSupplier, RequestAuthorizationContext context) {
        String requestUri = context.getRequest().getRequestURI();
        Authentication authentication = authenticationSupplier.get();

        if (!(authentication.getPrincipal() instanceof User instructor)) {
            return new AuthorizationDecision(false);
        }

        boolean hasInstructorRole = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_INSTRUCTOR"));

        if (!hasInstructorRole) {
            return new AuthorizationDecision(false);
        }

        for (String pattern : PATH_PATTERNS) {
            if (pathMatcher.match(pattern, requestUri)) {
                Map<String, String> uriVariables = pathMatcher.extractUriTemplateVariables(pattern, requestUri);

                if (uriVariables.containsKey("instructorId")) {
                    String userIdFromRequestUri = uriVariables.get("instructorId");
                    String userIdFromPrincipal = String.valueOf(instructor.getId());

                    return new AuthorizationDecision(userIdFromRequestUri.equals(userIdFromPrincipal));
                }

                return new AuthorizationDecision(true);
            }
        }

        return new AuthorizationDecision(false);
    }
}

