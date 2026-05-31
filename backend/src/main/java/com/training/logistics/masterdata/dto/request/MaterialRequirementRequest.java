package com.training.logistics.masterdata.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MaterialRequirementRequest(
        @NotNull Long materialId,
        @NotNull @Positive Integer defaultQuantity,
        @NotNull Boolean dependOnNumParticipant,
        Integer participantPerQuantity,
        String notes
) {
}
