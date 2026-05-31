package com.training.logistics.masterdata.external;

import com.training.logistics.facility_contract.external.MasterDataClient;
import com.training.logistics.masterdata.repository.AudioVisualEquipmentRepository;
import com.training.logistics.seminar.repository.SeminarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MasterDataClientImpl implements MasterDataClient {
    private final AudioVisualEquipmentRepository audioVisualEquipmentRepository;
    private final SeminarRepository seminarRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean existsEquipmentById(Long equipmentId) {
        return equipmentId != null && audioVisualEquipmentRepository.existsById(equipmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Integer> getAnticipatedRegistrants(Long seminarId) {
        if (seminarId == null) {
            return Optional.empty();
        }

        return seminarRepository.findById(seminarId)
                .map(seminar -> seminar.getAnticipatedRegistrants());
    }
}
