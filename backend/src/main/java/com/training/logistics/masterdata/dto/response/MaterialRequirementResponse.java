package com.training.logistics.masterdata.dto.response;

public record MaterialRequirementResponse(
        Long seminarTypeId,
        Long materialId,
        String materialName,
        String materialType,
        String unit,
        Integer defaultQuantity,
        Boolean dependOnNumParticipant,
        Integer participantPerQuantity,
        String notes
) {
}
