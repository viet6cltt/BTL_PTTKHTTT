package com.training.logistics.masterdata.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AvEquipmentRequirementRequest(
        @NotNull Long equipmentId,
        @NotNull @Positive Integer quantityRequired,
        @NotNull Boolean dependOnNumParticipant,
        Integer participantPerQuantity
) {
}
