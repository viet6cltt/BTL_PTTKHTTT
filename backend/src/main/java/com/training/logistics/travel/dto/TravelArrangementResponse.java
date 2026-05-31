package com.training.logistics.travel.dto;

import com.training.logistics.travel.model.TransportMode;
import com.training.logistics.travel.model.TravelArrangementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TravelArrangementResponse {
    private Long travelArrangementId;
    private Long seminarId;
    private Long consultantId;
    private String travelAgencyName;
    private TransportMode transportMode;
    private String carrierName;
    private String serviceNumber;
    private String departureLocation;
    private String arrivalLocation;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String seatInfo;
    private BigDecimal cost;
    private LocalDateTime finalizedAt;
    private LocalDateTime notificationSentAt;
    private TravelArrangementStatus status;
}
