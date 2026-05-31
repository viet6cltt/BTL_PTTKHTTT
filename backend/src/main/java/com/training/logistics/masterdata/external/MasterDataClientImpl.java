package com.training.logistics.masterdata.external;

import com.training.logistics.facility_contract.external.MasterDataClient;
import com.training.logistics.masterdata.repository.AudioVisualEquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class MasterDataClientImpl implements MasterDataClient {
    private final AudioVisualEquipmentRepository audioVisualEquipmentRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean existsEquipmentById(Long equipmentId) {
        return equipmentId != null && audioVisualEquipmentRepository.existsById(equipmentId);
    }
}
