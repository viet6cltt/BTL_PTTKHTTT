package com.training.logistics.facility_contract.external;

import java.util.Optional;

/**
 * Interface dung de module facility_contract hoi du lieu tu module masterdata.
 * Chi chua cac nghiep vu thuan tuy lien quan den Master Data (AV Equipment, v.v.)
 */
public interface MasterDataClient {
    boolean existsEquipmentById(Long equipmentId);
}
