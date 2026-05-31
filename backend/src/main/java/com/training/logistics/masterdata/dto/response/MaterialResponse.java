package com.training.logistics.masterdata.dto.response;

public record MaterialResponse(
        Long id,
        String materialName,
        String materialType,
        String description,
        String unit
) {
}
