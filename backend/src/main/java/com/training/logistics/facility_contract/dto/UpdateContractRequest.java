package com.training.logistics.facility_contract.dto;

import com.training.logistics.facility_contract.model.ContractStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateContractRequest {
    private Long facilityId;
    private LocalDate reservationDate;
    private LocalDate contractCreatedDate;
    private ContractStatus status;
    private BigDecimal totalCost;
}
