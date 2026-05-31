package com.training.logistics.masterdata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AudioVisualEquipmentRequest(
        @NotBlank String equipmentName,
        @NotBlank String equipmentType,
        @NotBlank String unit
) {
}
