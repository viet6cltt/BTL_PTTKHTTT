package com.training.logistics.facility_contract.external;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Interface nay dung de goi sang module Seminar (do nhom khac dam nhan).
 * Hien tai de trong/gia lap de phuc vu test noi bo module facility_contract.
 */
public interface SeminarClient {
    boolean existsSeminarById(Long seminarId);

    Optional<SeminarScheduleSnapshot> getSeminarSchedule(Long seminarId);

    void markFacilitySecured(Long seminarId);

    record SeminarScheduleSnapshot(LocalDate startDate, LocalDate endDate, String expectedTimeSlot) {
    }
}
