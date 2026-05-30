package com.training.logistics.facility_contract.mapper;

import com.training.logistics.facility_contract.dto.AudioVisualEquipmentResponse;
import com.training.logistics.facility_contract.dto.AvEquipmentRequirementResponse;
import com.training.logistics.facility_contract.dto.AvEquipmentReservationResponse;
import com.training.logistics.facility_contract.dto.ContractDocumentResponse;
import com.training.logistics.facility_contract.dto.ContractResponse;
import com.training.logistics.facility_contract.dto.FacilityResponse;
import com.training.logistics.facility_contract.dto.FinalContractSummaryResponse;
import com.training.logistics.facility_contract.dto.RoomReservationResponse;
import com.training.logistics.facility_contract.model.AudioVisualEquipment;
import com.training.logistics.facility_contract.model.AvEquipmentRequirement;
import com.training.logistics.facility_contract.model.AvEquipmentReservation;
import com.training.logistics.facility_contract.model.ContractDocument;
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
                facility.getPhone(),
                facility.getEmail(),
                facility.getSalesManagerName(),
                facility.getSalesManagerPhone(),
                facility.getSalesManagerEmail(),
                facility.getNumberOfRoom(),
                facility.getCostForEachDay()
        );
    }

    public static ContractDocumentResponse toDocumentResponse(ContractDocument document) {
        if (document == null) {
            return null;
        }
        return new ContractDocumentResponse(
                document.getDocumentId(),
                document.getContract().getContractId(),
                document.getFileName(),
                document.getFileType(),
                document.getFileUrl(),
                document.getUploadedAt(),
                document.getNotes()
        );
    }

    public static RoomReservationResponse toRoomResponse(FacilityRoomReservation room) {
        return new RoomReservationResponse(
                room.getRoomId(),
                room.getContract().getContractId(),
                room.getNumSeats(),
                room.getStartTime(),
                room.getEndTime(),
                room.getRoomWidth(),
                room.getRoomLength(),
                room.getSeatArrangementNotes(),
                room.getRoomCost()
        );
    }

    public static AudioVisualEquipmentResponse toEquipmentResponse(AudioVisualEquipment equipment) {
        return new AudioVisualEquipmentResponse(
                equipment.getEquipmentId(),
                equipment.getEquipmentName(),
                equipment.getEquipmentType(),
                equipment.getUnit()
        );
    }

    public static AvEquipmentRequirementResponse toRequirementResponse(AvEquipmentRequirement requirement) {
        return new AvEquipmentRequirementResponse(
                requirement.getSeminarTypeId(),
                requirement.getEquipment().getEquipmentId(),
                requirement.getEquipment().getEquipmentName(),
                requirement.getQuantityRequired(),
                requirement.getIsDependOnNumParticipant(),
                requirement.getParticipantPerQuantity()
        );
    }

    public static AvEquipmentReservationResponse toAvReservationResponse(AvEquipmentReservation reservation) {
        return new AvEquipmentReservationResponse(
                reservation.getContract().getContractId(),
                reservation.getEquipment().getEquipmentId(),
                reservation.getEquipment().getEquipmentName(),
                reservation.getQuantityReserved(),
                reservation.getCostForEachEquipment()
        );
    }

    public static ContractResponse toContractResponse(SeminarFacilityContract contract) {
        return new ContractResponse(
                contract.getContractId(),
                contract.getSeminarId(),
                toFacilityResponse(contract.getFacility()),
                contract.getReservationDate(),
                contract.getContractCreatedDate(),
                contract.getStatus(),
                contract.getTotalCost(),
                toDocumentResponse(contract.getContractDocument()),
                toRoomResponses(contract.getRoomReservations()),
                toAvReservationResponses(contract.getAvReservations())
        );
    }

    public static FinalContractSummaryResponse toFinalSummaryResponse(SeminarFacilityContract contract) {
        ContractDocument document = contract.getContractDocument();
        return new FinalContractSummaryResponse(
                contract.getContractId(),
                contract.getSeminarId(),
                contract.getFacility().getFacilityName(),
                contract.getFacility().getAddress(),
                contract.getFacility().getSalesManagerName(),
                contract.getReservationDate(),
                contract.getContractCreatedDate(),
                contract.getStatus(),
                contract.getTotalCost(),
                document == null ? null : document.getFileUrl(),
                toRoomResponses(contract.getRoomReservations()),
                toAvReservationResponses(contract.getAvReservations())
        );
    }

    public static List<RoomReservationResponse> toRoomResponses(List<FacilityRoomReservation> rooms) {
        if (rooms == null) {
            return Collections.emptyList();
        }
        return rooms.stream().map(FacilityContractMapper::toRoomResponse).toList();
    }

    public static List<AvEquipmentReservationResponse> toAvReservationResponses(List<AvEquipmentReservation> reservations) {
        if (reservations == null) {
            return Collections.emptyList();
        }
        return reservations.stream().map(FacilityContractMapper::toAvReservationResponse).toList();
    }
}
