package com.training.logistics.facility_contract.external;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Primary
public class StubMasterDataClient implements MasterDataClient {
    @Override
    public boolean existsEquipmentById(Long equipmentId) {
        return equipmentId != null && equipmentId > 0;
    }

    @Override
    public Optional<Integer> getAnticipatedRegistrants(Long seminarId) {
        return Optional.empty();
    }
}
