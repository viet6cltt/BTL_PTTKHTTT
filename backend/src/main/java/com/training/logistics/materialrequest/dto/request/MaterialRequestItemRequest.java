package com.training.logistics.materialrequest.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MaterialRequestItemRequest(
        @NotNull Long materialId,
        @NotNull @Positive Integer requestedQuantity,
        String notes
) {
}
