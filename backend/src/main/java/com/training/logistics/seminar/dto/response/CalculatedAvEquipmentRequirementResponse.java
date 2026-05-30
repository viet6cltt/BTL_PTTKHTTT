package com.training.logistics.seminar.dto.response;

public record CalculatedAvEquipmentRequirementResponse(
        Long equipmentId,
        String equipmentName,
        String equipmentType,
        String unit,
        Integer calculatedQuantity,
        Boolean dependOnNumParticipant,
        Integer participantPerQuantity,
        Integer quantityRequired
) {
}
