package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RoomReservationRequest {
    @NotNull
    @Positive
    private Integer numSeats;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @PositiveOrZero
    private BigDecimal roomWidth;

    @PositiveOrZero
    private BigDecimal roomLength;

    private String seatArrangementNotes;

    @PositiveOrZero
    private BigDecimal roomCost;
}
