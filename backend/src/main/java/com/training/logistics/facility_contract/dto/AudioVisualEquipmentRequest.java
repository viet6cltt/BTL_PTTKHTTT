package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AudioVisualEquipmentRequest {
    @NotBlank
    @Size(max = 150)
    private String equipmentName;

    @Size(max = 100)
    private String equipmentType;

    @Size(max = 50)
    private String unit;
}
