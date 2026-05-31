package com.training.logistics.facility_contract.external;

import java.util.Optional;

/**
 * Interface nay dung de module facility_contract hoi du lieu masterdata/seminar
 * trong modular monolith ma khong phu thuoc truc tiep vao repository cua module khac.
 */
public interface MasterDataClient {
    boolean existsEquipmentById(Long equipmentId);

    Optional<Integer> getAnticipatedRegistrants(Long seminarId);
}
