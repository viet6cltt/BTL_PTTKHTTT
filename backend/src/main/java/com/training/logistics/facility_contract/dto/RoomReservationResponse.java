package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RoomReservationResponse {
    private Long roomId;
    private Long contractId;
    private Integer numSeats;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal roomWidth;
    private BigDecimal roomLength;
    private String seatArrangementNotes;
    private BigDecimal roomCost;
}
