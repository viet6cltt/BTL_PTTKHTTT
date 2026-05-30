package com.training.logistics.facility_contract.dto;

import com.training.logistics.facility_contract.model.ContractStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateContractRequest {
    @NotNull
    private Long seminarId;

    @NotNull
    private Long facilityId;

    private LocalDate reservationDate;
    private ContractStatus status;
    private BigDecimal totalCost;
}
