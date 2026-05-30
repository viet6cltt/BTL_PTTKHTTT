package com.training.logistics.masterdata.dto.response;

public record AvEquipmentRequirementResponse(
        Long seminarTypeId,
        Long equipmentId,
        String equipmentName,
        String equipmentType,
        String unit,
        Integer quantityRequired,
        Boolean dependOnNumParticipant,
        Integer participantPerQuantity
) {
}
