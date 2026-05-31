package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectFacilityContractRequest {
    @NotBlank
    private String notes;
}
