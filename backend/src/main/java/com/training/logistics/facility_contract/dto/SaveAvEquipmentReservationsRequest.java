package com.training.logistics.facility_contract.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaveAvEquipmentReservationsRequest {
    @NotNull
    private Long contractId;

    @Valid
    @NotEmpty
    private List<AvEquipmentReservationItemRequest> equipments;
}
