package com.training.logistics.facility_contract.external;

import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.FacilityRoomReservation;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import com.training.logistics.travel.external.FacilityContractClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FacilityContractClientImpl implements FacilityContractClient {
    private final SeminarFacilityContractRepository contractRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<FacilityReservationSnapshot> getReservationSnapshotBySeminarId(Long seminarId) {
        if (seminarId == null) {
            return Optional.empty();
        }

        return contractRepository.findBySeminarId(seminarId)
                .filter(contract -> contract.getStatus() == ContractStatus.APPROVED)
                .map(this::toSnapshot);
    }

    private FacilityReservationSnapshot toSnapshot(SeminarFacilityContract contract) {
        List<String> roomNameSpecs = contract.getRoomReservations().stream()
                .map(FacilityRoomReservation::getRoomNameSpec)
                .filter(roomName -> roomName != null && !roomName.isBlank())
                .toList();

        return new FacilityReservationSnapshot(
                contract.getSeminarId(),
                contract.getFacility().getFacilityName(),
                contract.getFacility().getAddress(),
                roomNameSpecs
        );
    }
}
