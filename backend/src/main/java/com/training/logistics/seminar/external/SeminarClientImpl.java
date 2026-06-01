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
    public void verifyCoordinator(Long seminarId) {
        Seminar seminar = seminarService.findEntity(seminarId);
        com.training.logistics.auth.model.User coordinator = seminar.getCoordinator();
        if (coordinator == null) {
            throw new com.training.logistics.common.exception.BadRequestException("This seminar has not been claimed by a coordinator yet");
        }
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new com.training.logistics.common.exception.BadRequestException("Authentication is required");
        }
        Long currentUserId;
        try {
            currentUserId = Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new com.training.logistics.common.exception.BadRequestException("Current user id is invalid");
        }
        if (!coordinator.getUserId().equals(currentUserId)) {
            throw new com.training.logistics.common.exception.BadRequestException("Only the coordinator assigned to this seminar can perform this action");
        }
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
