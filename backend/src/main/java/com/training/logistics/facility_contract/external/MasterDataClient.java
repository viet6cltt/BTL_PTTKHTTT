package com.training.logistics.facility_contract.external;

import java.util.Optional;

/**
 * Interface nay dung de goi sang Module Masterdata (do nhom khac dam nhan).
 * Hien tai de trong/gia lap de phuc vu test noi bo module facility_contract.
 */
public interface MasterDataClient {
    // TODO: Nhom Masterdata se trien khai (implement) ham nay sau
    boolean existsEquipmentById(Long equipmentId);

    // TODO: Nhom Seminar/Masterdata se trien khai ham nay sau
    Optional<Integer> getAnticipatedRegistrants(Long seminarId);
}
