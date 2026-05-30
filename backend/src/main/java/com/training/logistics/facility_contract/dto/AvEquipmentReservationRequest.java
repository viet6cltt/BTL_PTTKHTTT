package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AvEquipmentReservationRequest {
    private Long contractId;

    @NotNull
    private Long equipmentId;

    @NotNull
    @Positive
    private Integer quantityReserved;

    @PositiveOrZero
    private BigDecimal costForEachEquipment;
}
