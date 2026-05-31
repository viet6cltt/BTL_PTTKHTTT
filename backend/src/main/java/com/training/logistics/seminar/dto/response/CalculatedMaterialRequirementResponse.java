package com.training.logistics.seminar.dto.response;

public record CalculatedMaterialRequirementResponse(
        Long materialId,
        String materialName,
        String materialType,
        String unit,
        Integer calculatedQuantity,
        Boolean dependOnNumParticipant,
        Integer participantPerQuantity,
        Integer defaultQuantity,
        String notes
) {
}
