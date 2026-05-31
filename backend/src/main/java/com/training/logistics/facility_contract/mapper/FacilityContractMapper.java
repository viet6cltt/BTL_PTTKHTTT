package com.training.logistics.facility_contract.mapper;

import com.training.logistics.facility_contract.dto.AvEquipmentReservationResponse;
import com.training.logistics.facility_contract.dto.FacilityContractResponse;
import com.training.logistics.facility_contract.dto.FacilityResponse;
import com.training.logistics.facility_contract.dto.RoomReservationResponse;
import com.training.logistics.facility_contract.dto.SeminarReservationResponse;
import com.training.logistics.facility_contract.model.AvEquipmentReservation;
import com.training.logistics.facility_contract.model.Facility;
import com.training.logistics.facility_contract.model.FacilityRoomReservation;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;

import java.util.Collections;
import java.util.List;

public final class FacilityContractMapper {
    private FacilityContractMapper() {
    }

    public static FacilityResponse toFacilityResponse(Facility facility) {
        return new FacilityResponse(
                facility.getFacilityId(),
                facility.getFacilityName(),
                facility.getAddress(),
                facility.getCity(),
                facility.getMaxCapacity(),
                facility.getSalesManagerName(),
                facility.getSalesManagerPhone(),
                facility.getSalesManagerEmail(),
                facility.getNumberOfRoom(),
                facility.getCostForEachDay(),
                facility.getCreatedAt()
        );
    }

    public static FacilityContractResponse toFacilityContractResponse(SeminarFacilityContract contract) {
        return new FacilityContractResponse(
                contract.getContractId(),
                contract.getSeminarId(),
                contract.getFacility().getFacilityId(),
                contract.getFacility().getFacilityName(),
                contract.getTotalCost(),
                contract.getContractCreatedTime(),
                contract.getContractDocPath(),
                contract.getStatus(),
                contract.getNotes()
        );
    }

    public static AvEquipmentReservationResponse toAvReservationResponse(AvEquipmentReservation reservation) {
        return new AvEquipmentReservationResponse(
                reservation.getContract().getContractId(),
                reservation.getEquipmentId(),
                reservation.getQuantityReserved(),
                reservation.getCostForEachEquipment()
        );
    }

    public static List<AvEquipmentReservationResponse> toAvReservationResponses(List<AvEquipmentReservation> reservations) {
        if (reservations == null) {
            return Collections.emptyList();
        }
        return reservations.stream().map(FacilityContractMapper::toAvReservationResponse).toList();
    }

    public static RoomReservationResponse toRoomReservationResponse(FacilityRoomReservation reservation) {
        return new RoomReservationResponse(
                reservation.getRoomReservationId(),
                reservation.getContract().getContractId(),
                reservation.getRoomNameSpec(),
                reservation.getSeatingArrangement(),
                reservation.getNumSeats(),
                reservation.getRoomImageUrl()
        );
    }

    public static List<RoomReservationResponse> toRoomReservationResponses(List<FacilityRoomReservation> reservations) {
        if (reservations == null) {
            return Collections.emptyList();
        }
        return reservations.stream().map(FacilityContractMapper::toRoomReservationResponse).toList();
    }

    public static SeminarReservationResponse toSeminarReservationResponse(SeminarFacilityContract contract) {
        return new SeminarReservationResponse(
                contract.getSeminarId(),
                contract.getContractId(),
                contract.getFacility().getFacilityName(),
                contract.getFacility().getAddress(),
                contract.getStatus(),
                contract.getContractDocPath(),
                contract.getTotalCost(),
                toAvReservationResponses(contract.getAvReservations()),
                toRoomReservationResponses(contract.getRoomReservations())
        );
    }
}
