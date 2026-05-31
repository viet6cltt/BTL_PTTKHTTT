package com.training.logistics.masterdata.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SeminarTypeRequest(
        @NotBlank String typeName,
        String description,
        @NotNull @Positive Integer durationHours,
        String arrangementNotes
) {
}
