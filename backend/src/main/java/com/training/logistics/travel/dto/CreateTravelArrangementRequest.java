package com.training.logistics.travel.dto;

import com.training.logistics.travel.model.TransportMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateTravelArrangementRequest {
    @NotNull
    private Long seminarId;

    @NotNull
    private Long consultantId;

    @Size(max = 255)
    private String travelAgencyName;

    @NotNull
    private TransportMode transportMode;

    @Size(max = 255)
    private String carrierName;

    @Size(max = 100)
    private String serviceNumber;

    @NotBlank
    @Size(max = 255)
    private String departureLocation;

    @NotBlank
    @Size(max = 255)
    private String arrivalLocation;

    @NotNull
    private LocalDateTime departureTime;

    @NotNull
    private LocalDateTime arrivalTime;

    @Size(max = 255)
    private String seatInfo;

    @PositiveOrZero
    private BigDecimal cost;
}
