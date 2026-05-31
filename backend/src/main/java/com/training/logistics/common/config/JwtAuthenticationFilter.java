package com.training.logistics.common.config;

import com.training.logistics.common.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        // nếu không có token -> qua, security sẽ check tiếp
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtUtils.validateToken(token)) {
                Claims claims = jwtUtils.extractAllClaims(token);
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    GrantedAuthority authority = new SimpleGrantedAuthority(roleName);

                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, List.of(authority)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

                filterChain.doFilter(request, response);
            } else {
                handleExceptionResponse(response, "Token is not valid or expired!");
            }
        } catch (Exception e) {
            handleExceptionResponse(response, "Error: " + e.getMessage());
        }
    }

    private void handleExceptionResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String jsonPayload = String.format("{\"message\": \"%s\"}", message);
        response.getWriter().write(jsonPayload);
    }
}
