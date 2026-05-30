package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SignContractRequest {
    @NotNull
    private BigDecimal totalCost;
}
