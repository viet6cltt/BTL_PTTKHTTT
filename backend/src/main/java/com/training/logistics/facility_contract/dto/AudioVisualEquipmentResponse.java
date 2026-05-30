package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AudioVisualEquipmentResponse {
    private Long equipmentId;
    private String equipmentName;
    private String equipmentType;
    private String unit;
}
