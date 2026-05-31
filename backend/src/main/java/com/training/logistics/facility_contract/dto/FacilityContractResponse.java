package com.training.logistics.facility_contract.dto;

import com.training.logistics.facility_contract.model.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FacilityContractResponse {
    private Long contractId;
    private Long seminarId;
    private Long facilityId;
    private String facilityName;
    private BigDecimal totalCost;
    private LocalDateTime contractCreatedTime;
    private String contractDocPath;
    private ContractStatus status;
    private String notes;
}
