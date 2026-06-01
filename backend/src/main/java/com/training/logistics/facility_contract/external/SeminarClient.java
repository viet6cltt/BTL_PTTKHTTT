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

    void verifyCoordinator(Long seminarId);

    /**
     * Tra ve so luong hoc vien du kien cua mot Seminar.
     * Dung de validate tong so cho ngoi phong hop phai du cho tat ca hoc vien.
     */
    Optional<Integer> getAnticipatedRegistrants(Long seminarId);

    record SeminarScheduleSnapshot(LocalDate startDate, LocalDate endDate, String expectedTimeSlot) {
    }
}
