package com.training.logistics.facility_contract.external;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Primary
public class StubSeminarClient implements SeminarClient {
    @Override
    public boolean existsSeminarById(Long seminarId) {
        return seminarId != null && seminarId > 0;
    }

    @Override
    public Optional<SeminarScheduleSnapshot> getSeminarSchedule(Long seminarId) {
        return Optional.empty();
    }

    @Override
    public void markFacilitySecured(Long seminarId) {
        // TODO: nhom Seminar se thay the bang integration thuc te sau.
    }
}
