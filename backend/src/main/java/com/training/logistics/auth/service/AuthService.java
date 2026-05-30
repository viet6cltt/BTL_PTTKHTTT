package com.training.logistics.auth.service;

import com.training.logistics.auth.dto.AuthResponse;
import com.training.logistics.auth.dto.LoginRequest;
import com.training.logistics.auth.dto.RegisterRequest;
import com.training.logistics.auth.dto.TokenValidationResponse;
import com.training.logistics.auth.dto.UserResponse;
import com.training.logistics.auth.exception.InvalidCredentialsException;
import com.training.logistics.auth.exception.InvalidTokenException;
import com.training.logistics.auth.exception.UserAlreadyExistsException;
import com.training.logistics.auth.model.User;
import com.training.logistics.auth.model.UserRole;
import com.training.logistics.auth.model.UserStatus;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.common.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .role(request.getRole() == null ? UserRole.BOOKING_STAFF : request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidCredentialsException("User account is disabled");
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new InvalidTokenException("Authentication token is required");
        }

        Long userId = parseUserId(authentication.getPrincipal().toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("User not found for token"));

        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public TokenValidationResponse validateToken(String token) {
        String rawToken = stripBearerPrefix(token);
        if (!jwtUtils.validateToken(rawToken)) {
            throw new InvalidTokenException("Token is invalid or expired");
        }

        Claims claims = jwtUtils.extractAllClaims(rawToken);
        Long userId = parseUserId(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("User not found for token"));

        return new TokenValidationResponse(true, UserResponse.from(user));
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(TOKEN_TYPE, token, UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String stripBearerPrefix(String token) {
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return token.substring(7).trim();
        }
        return token.trim();
    }

    private Long parseUserId(String subject) {
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException ex) {
            throw new InvalidTokenException("Token subject is invalid");
        }
    }
}
