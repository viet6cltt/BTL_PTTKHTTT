package com.training.logistics.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String tokenType;
    private String accessToken;
    private UserResponse user;
}
