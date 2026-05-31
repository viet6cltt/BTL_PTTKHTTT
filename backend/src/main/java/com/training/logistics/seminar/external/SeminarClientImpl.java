package com.training.logistics.seminar.external;

import com.training.logistics.facility_contract.external.SeminarClient;
import com.training.logistics.seminar.model.Seminar;
import com.training.logistics.seminar.service.SeminarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SeminarClientImpl implements SeminarClient {
    private final SeminarService seminarService;

    @Override
    @Transactional(readOnly = true)
    public boolean existsSeminarById(Long seminarId) {
        return seminarId != null && seminarService.existsById(seminarId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SeminarScheduleSnapshot> getSeminarSchedule(Long seminarId) {
        if (seminarId == null) {
            return Optional.empty();
        }

        Seminar seminar = seminarService.findEntity(seminarId);
        return Optional.of(new SeminarScheduleSnapshot(
                seminar.getStartDate(),
                seminar.getEndDate(),
                seminar.getExpectedTimeSlot().name()
        ));
    }

    @Override
    @Transactional
    public void markFacilitySecured(Long seminarId) {
        seminarService.markFacilitySecured(seminarId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Integer> getAnticipatedRegistrants(Long seminarId) {
        if (seminarId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(seminarService.findEntity(seminarId).getAnticipatedRegistrants());
    }
}
