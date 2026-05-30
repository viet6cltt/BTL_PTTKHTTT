package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AvEquipmentRequirementRequest {
    @NotNull
    private Long seminarTypeId;

    @NotNull
    private Long equipmentId;

    @NotNull
    @Positive
    private Integer quantityRequired;

    private Boolean isDependOnNumParticipant;

    @Positive
    private Integer participantPerQuantity;
}
