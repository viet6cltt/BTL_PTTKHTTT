package com.training.logistics.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenValidationRequest {
    @NotBlank
    private String token;
}
