package com.training.logistics.facility_contract.dto;

import com.training.logistics.facility_contract.model.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class SeminarReservationResponse {
    private Long seminarId;
    private Long contractId;
    private String facilityName;
    private String facilityAddress;
    private ContractStatus contractStatus;
    private String contractDocPath;
    private BigDecimal totalCost;
    private List<AvEquipmentReservationResponse> avEquipments;
    private List<RoomReservationResponse> roomReservations;
}
