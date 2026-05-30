package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AvEquipmentRequirementResponse {
    private Long seminarTypeId;
    private Long equipmentId;
    private String equipmentName;
    private Integer quantityRequired;
    private Boolean isDependOnNumParticipant;
    private Integer participantPerQuantity;
}
