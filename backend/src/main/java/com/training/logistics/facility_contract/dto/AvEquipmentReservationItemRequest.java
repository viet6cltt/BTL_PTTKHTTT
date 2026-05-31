package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AvEquipmentReservationItemRequest {
    @NotNull
    private Long equipmentId;

    @NotNull
    @PositiveOrZero
    private Integer quantityReserved;

    @PositiveOrZero
    private BigDecimal costForEachEquipment;
}
