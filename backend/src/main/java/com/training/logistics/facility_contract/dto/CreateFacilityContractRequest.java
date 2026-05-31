package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateFacilityContractRequest {
    @NotNull
    private Long seminarId;

    @NotNull
    private Long facilityId;
}
