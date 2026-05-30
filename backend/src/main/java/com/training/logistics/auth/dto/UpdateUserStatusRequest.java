package com.training.logistics.auth.dto;

import com.training.logistics.auth.model.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    @NotNull
    private UserStatus status;
}
