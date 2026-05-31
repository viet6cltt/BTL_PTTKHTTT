package com.training.logistics.travel.mapper;

import com.training.logistics.travel.dto.CreateTravelArrangementRequest;
import com.training.logistics.travel.dto.TravelArrangementResponse;
import com.training.logistics.travel.dto.UpdateTravelArrangementRequest;
import com.training.logistics.travel.model.TravelArrangement;
import com.training.logistics.travel.model.TravelArrangementStatus;

public final class TravelArrangementMapper {
    private TravelArrangementMapper() {
    }

    public static TravelArrangement toEntity(CreateTravelArrangementRequest request) {
        return TravelArrangement.builder()
                .seminarId(request.getSeminarId())
                .consultantId(request.getConsultantId())
                .travelAgencyName(trim(request.getTravelAgencyName()))
                .transportMode(request.getTransportMode())
                .carrierName(trim(request.getCarrierName()))
                .serviceNumber(trim(request.getServiceNumber()))
                .departureLocation(request.getDepartureLocation().trim())
                .arrivalLocation(request.getArrivalLocation().trim())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .seatInfo(trim(request.getSeatInfo()))
                .cost(request.getCost())
                .travelArrangementStatus(TravelArrangementStatus.BOOKED)
                .build();
    }

    public static TravelArrangementResponse toResponse(TravelArrangement arrangement) {
        return new TravelArrangementResponse(
                arrangement.getTravelArrangementId(),
                arrangement.getSeminarId(),
                arrangement.getConsultantId(),
                arrangement.getTravelAgencyName(),
                arrangement.getTransportMode(),
                arrangement.getCarrierName(),
                arrangement.getServiceNumber(),
                arrangement.getDepartureLocation(),
                arrangement.getArrivalLocation(),
                arrangement.getDepartureTime(),
                arrangement.getArrivalTime(),
                arrangement.getSeatInfo(),
                arrangement.getCost(),
                arrangement.getConfirmationSentDatetime(),
                arrangement.getTravelArrangementStatus()
        );
    }

    public static void updateEntityFromRequest(UpdateTravelArrangementRequest request, TravelArrangement arrangement) {
        if (request.getTravelAgencyName() != null) {
            arrangement.setTravelAgencyName(trim(request.getTravelAgencyName()));
        }
        if (request.getTransportMode() != null) {
            arrangement.setTransportMode(request.getTransportMode());
        }
        if (request.getCarrierName() != null) {
            arrangement.setCarrierName(trim(request.getCarrierName()));
        }
        if (request.getServiceNumber() != null) {
            arrangement.setServiceNumber(trim(request.getServiceNumber()));
        }
        if (request.getDepartureLocation() != null) {
            arrangement.setDepartureLocation(request.getDepartureLocation().trim());
        }
        if (request.getArrivalLocation() != null) {
            arrangement.setArrivalLocation(request.getArrivalLocation().trim());
        }
        if (request.getDepartureTime() != null) {
            arrangement.setDepartureTime(request.getDepartureTime());
        }
        if (request.getArrivalTime() != null) {
            arrangement.setArrivalTime(request.getArrivalTime());
        }
        if (request.getSeatInfo() != null) {
            arrangement.setSeatInfo(trim(request.getSeatInfo()));
        }
        if (request.getCost() != null) {
            arrangement.setCost(request.getCost());
        }
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
