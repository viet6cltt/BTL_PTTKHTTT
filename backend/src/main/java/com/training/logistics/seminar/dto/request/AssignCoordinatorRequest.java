package com.training.logistics.seminar.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignCoordinatorRequest(
        @NotNull Long logisticsCoordinatorId
) {
}
