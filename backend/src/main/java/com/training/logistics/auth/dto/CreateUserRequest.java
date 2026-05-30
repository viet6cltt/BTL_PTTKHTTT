package com.training.logistics.auth.dto;

import com.training.logistics.auth.model.UserRole;
import com.training.logistics.auth.model.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank
    @Size(max = 100)
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    @Size(max = 20)
    private String phone;

    private UserRole role;

    private UserStatus status;
}
