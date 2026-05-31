package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AvEquipmentReservationResponse {
    private Long contractId;
    private Long equipmentId;
    private Integer quantityReserved;
    private BigDecimal costForEachEquipment;
}
