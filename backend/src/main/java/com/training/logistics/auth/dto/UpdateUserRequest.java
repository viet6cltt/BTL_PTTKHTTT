package com.training.logistics.auth.dto;

import com.training.logistics.auth.model.UserRole;
import com.training.logistics.auth.model.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(max = 100)
    private String fullName;

    @Email
    private String email;

    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 20)
    private String phone;

    private UserRole role;

    private UserStatus status;
}
