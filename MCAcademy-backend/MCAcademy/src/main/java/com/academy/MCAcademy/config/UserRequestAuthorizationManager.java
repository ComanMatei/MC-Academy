package com.academy.MCAcademy.config;

import com.academy.MCAcademy.entity.User;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.util.UriTemplate;

import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Component
public class UserRequestAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private static final List<String> ADMIN_ALLOWED_PATTERNS = List.of(
            "/api/v1/user/info/{userId}"
    );

    private static final List<String> STUDENT_INSTRUCTOR_ONLY_PATTERNS = List.of(
            "/api/v1/user/edit/{userId}",
            "/api/v1/user/{userId}/only/{id}"
    );

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authenticationSupplier,
                                       RequestAuthorizationContext context) {
        String requestUri = context.getRequest().getRequestURI();
        Authentication authentication = authenticationSupplier.get();

        if (!(authentication.getPrincipal() instanceof User user)) {
            return new AuthorizationDecision(false);
        }

        String userIdFromPrincipal = String.valueOf(user.getId());

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isStudentOrInstructor = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_STUDENT") || auth.getAuthority()
                        .equals("ROLE_INSTRUCTOR"));

        for (String pattern : ADMIN_ALLOWED_PATTERNS) {
            if (pathMatcher.match(pattern, requestUri)) {
                Map<String, String> variables = pathMatcher.extractUriTemplateVariables(pattern, requestUri);
                String userIdFromUri = variables.get("userId");
                return new AuthorizationDecision(
                        isAdmin || (isStudentOrInstructor && userIdFromUri.equals(userIdFromPrincipal))
                );
            }
        }

        for (String pattern : STUDENT_INSTRUCTOR_ONLY_PATTERNS) {
            if (pathMatcher.match(pattern, requestUri)) {
                Map<String, String> variables = pathMatcher.extractUriTemplateVariables(pattern, requestUri);
                String userIdFromUri = variables.get("userId");
                return new AuthorizationDecision(
                        isStudentOrInstructor && userIdFromUri.equals(userIdFromPrincipal)
                );
            }
        }

        return new AuthorizationDecision(false);
    }
}