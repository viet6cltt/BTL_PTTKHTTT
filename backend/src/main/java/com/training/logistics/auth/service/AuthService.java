package com.training.logistics.auth.service;

import com.training.logistics.auth.dto.AuthResponse;
import com.training.logistics.auth.dto.ChangePasswordRequest;
import com.training.logistics.auth.dto.LoginRequest;
import com.training.logistics.auth.exception.InvalidCredentialsException;
import com.training.logistics.auth.exception.InvalidTokenException;
import com.training.logistics.auth.model.User;
import com.training.logistics.auth.model.UserStatus;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.common.utils.JwtUtils;
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
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

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

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = findCurrentUser();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Old password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateToken(user.getUserId(), user.getRole().name());
        return new AuthResponse(token, user.getUserId(), user.getRole(), user.getFullName());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private User findCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new InvalidTokenException("Authentication token is required");
        }

        Long userId = parseUserId(authentication.getPrincipal().toString());
        return userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("User not found for token"));
    }

    private Long parseUserId(String subject) {
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException ex) {
            throw new InvalidTokenException("Token subject is invalid");
        }
    }
}
