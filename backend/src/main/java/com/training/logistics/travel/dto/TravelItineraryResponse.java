package com.training.logistics.travel.dto;

import com.training.logistics.travel.model.TravelArrangementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class TravelItineraryResponse {
    private Long seminarId;
    private Long consultantId;
    private List<TravelArrangementResponse> arrangements;
    private List<TravelFacilityInfoResponse> facilityReservations;
    private BigDecimal totalCost;
    private TravelArrangementStatus overallStatus;
}
