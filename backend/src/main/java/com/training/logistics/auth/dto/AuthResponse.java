package com.training.logistics.auth.dto;

import com.training.logistics.auth.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private Long userId;
    private UserRole role;
    private String fullName;
}
