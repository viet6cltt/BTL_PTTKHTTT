package com.training.logistics.travel.dto;

import com.training.logistics.travel.model.TransportMode;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UpdateTravelArrangementRequest {
    @Size(max = 255)
    private String travelAgencyName;

    private TransportMode transportMode;

    @Size(max = 255)
    private String carrierName;

    @Size(max = 100)
    private String serviceNumber;

    @Size(max = 255)
    private String departureLocation;

    @Size(max = 255)
    private String arrivalLocation;

    private LocalDateTime departureTime;

    private LocalDateTime arrivalTime;

    @Size(max = 255)
    private String seatInfo;

    @PositiveOrZero
    private BigDecimal cost;
}
