package com.training.logistics.masterdata.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MaterialRequest(
        @NotBlank String materialName,
        @NotBlank String materialType,
        String description,
        @NotBlank String unit
) {
}
