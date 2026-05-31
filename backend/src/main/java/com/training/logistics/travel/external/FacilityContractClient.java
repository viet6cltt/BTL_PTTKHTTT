package com.training.logistics.travel.external;

import java.util.List;
import java.util.Optional;

/**
 * Interface gọi sang module facility_contract để lấy thông tin phòng/cơ sở cho itinerary.
 * Module facility_contract sẽ cung cấp implementation thật trong cùng modular monolith.
 */
public interface FacilityContractClient {
    Optional<FacilityReservationSnapshot> getReservationSnapshotBySeminarId(Long seminarId);

    record FacilityReservationSnapshot(
            Long seminarId,
            String facilityName,
            String facilityAddress,
            List<String> roomNameSpecs
    ) {
    }
}
