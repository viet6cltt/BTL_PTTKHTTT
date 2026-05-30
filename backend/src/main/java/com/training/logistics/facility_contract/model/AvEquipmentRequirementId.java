package com.training.logistics.facility_contract.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvEquipmentRequirementId implements Serializable {
    private Long seminarTypeId;
    private Long equipment;
}
