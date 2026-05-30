package com.training.logistics.facility_contract.dto;

import com.training.logistics.facility_contract.model.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class FinalContractSummaryResponse {
    private Long contractId;
    private Long seminarId;
    private String facilityName;
    private String facilityAddress;
    private String salesManagerName;
    private LocalDate reservationDate;
    private LocalDate contractCreatedDate;
    private ContractStatus status;
    private BigDecimal totalCost;
    private String documentUrl;
    private List<RoomReservationResponse> roomReservations;
    private List<AvEquipmentReservationResponse> avReservations;
}
