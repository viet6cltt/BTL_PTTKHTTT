package com.training.logistics.materialrequest.dto.response;

public record MaterialRequestItemResponse(
        Long materialId,
        Integer requestedQuantity,
        String materialName,
        String materialType,
        String unit,
        String notes
) {
}
