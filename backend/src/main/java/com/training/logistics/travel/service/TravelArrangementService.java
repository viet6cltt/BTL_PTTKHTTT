package com.training.logistics.travel.service;

import com.training.logistics.travel.dto.CreateTravelArrangementRequest;
import com.training.logistics.travel.dto.FinalizeTravelArrangementResponse;
import com.training.logistics.travel.dto.TravelArrangementResponse;
import com.training.logistics.travel.dto.TravelItineraryResponse;
import com.training.logistics.travel.dto.UpdateTravelArrangementRequest;
import com.training.logistics.travel.exception.ForbiddenTravelAccessException;
import com.training.logistics.travel.exception.InvalidTravelArrangementException;
import com.training.logistics.travel.exception.TravelArrangementNotFoundException;
import com.training.logistics.travel.mapper.TravelArrangementMapper;
import com.training.logistics.travel.model.TravelArrangement;
import com.training.logistics.travel.model.TravelArrangementStatus;
import com.training.logistics.travel.repository.TravelArrangementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelArrangementService {
    private final TravelArrangementRepository travelArrangementRepository;

    @Transactional
    public TravelArrangementResponse createTravelArrangement(CreateTravelArrangementRequest request) {
        TravelArrangement arrangement = TravelArrangementMapper.toEntity(request);
        validateArrangementData(arrangement);
        arrangement.setStatus(TravelArrangementStatus.DRAFT);
        arrangement.setFinalizedAt(null);
        arrangement.setNotificationSentAt(null);
        return TravelArrangementMapper.toResponse(travelArrangementRepository.save(arrangement));
    }

    @Transactional
    public TravelArrangementResponse updateTravelArrangement(Long travelArrangementId, UpdateTravelArrangementRequest request) {
        TravelArrangement arrangement = findArrangement(travelArrangementId);
        requireDraft(arrangement, "Only DRAFT travel arrangements can be updated");
        TravelArrangementMapper.updateEntityFromRequest(request, arrangement);
        validateArrangementData(arrangement);
        return TravelArrangementMapper.toResponse(arrangement);
    }

    @Transactional
    public void deleteTravelArrangement(Long travelArrangementId) {
        travelArrangementRepository.delete(findArrangement(travelArrangementId));
    }

    @Transactional
    public TravelArrangementResponse cancelTravelArrangement(Long travelArrangementId) {
        TravelArrangement arrangement = findArrangement(travelArrangementId);
        // TODO: seminar cancellation belongs to the seminar module, e.g. PATCH /api/v1/seminars/{seminarId}/cancel.
        arrangement.setStatus(TravelArrangementStatus.CANCELLED);
        arrangement.setFinalizedAt(null);
        arrangement.setNotificationSentAt(null);
        return TravelArrangementMapper.toResponse(arrangement);
    }

    @Transactional
    public FinalizeTravelArrangementResponse finalizeTravelArrangement(Long travelArrangementId) {
        TravelArrangement arrangement = findArrangement(travelArrangementId);
        requireDraft(arrangement, "Only DRAFT travel arrangements can be finalized");
        validateArrangementData(arrangement);

        LocalDateTime now = LocalDateTime.now();
        arrangement.setStatus(TravelArrangementStatus.FINALIZED);
        arrangement.setFinalizedAt(now);

        sendTravelItineraryNotificationPlaceholder(arrangement);
        arrangement.setNotificationSentAt(LocalDateTime.now());

        return TravelArrangementMapper.toFinalizeResponse(
                arrangement,
                "Travel itinerary finalized. Notification placeholder executed."
        );
    }

    @Transactional(readOnly = true)
    public TravelArrangementResponse getTravelArrangementById(Long travelArrangementId) {
        return TravelArrangementMapper.toResponse(findArrangement(travelArrangementId));
    }

    @Transactional(readOnly = true)
    public List<TravelArrangementResponse> getAllTravelArrangements() {
        return toSortedResponses(travelArrangementRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<TravelArrangementResponse> getTravelArrangementsBySeminar(Long seminarId) {
        return toSortedResponses(travelArrangementRepository.findBySeminarId(seminarId));
    }

    @Transactional(readOnly = true)
    public List<TravelArrangementResponse> getTravelArrangementsByConsultant(Long consultantId) {
        return toSortedResponses(travelArrangementRepository.findByConsultantId(consultantId));
    }

    @Transactional(readOnly = true)
    public List<TravelArrangementResponse> getFinalizedTravelArrangementsForConsultant(Long consultantId) {
        return toSortedResponses(travelArrangementRepository.findByConsultantIdAndStatus(
                consultantId,
                TravelArrangementStatus.FINALIZED
        ));
    }

    @Transactional(readOnly = true)
    public TravelItineraryResponse getTravelItinerary(Long seminarId, Long consultantId) {
        List<TravelArrangement> arrangements = travelArrangementRepository.findBySeminarIdAndConsultantId(seminarId, consultantId);
        return buildItineraryResponse(seminarId, consultantId, arrangements);
    }

    @Transactional(readOnly = true)
    public TravelItineraryResponse getMyTravelItineraryForCurrentConsultant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ForbiddenTravelAccessException("Authentication is required");
        }

        boolean isConsultant = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_CONSULTANT"::equals);
        if (!isConsultant) {
            throw new ForbiddenTravelAccessException("Only consultants can view their own travel itinerary here");
        }

        Long consultantId = parseCurrentUserId(authentication.getPrincipal().toString());
        List<TravelArrangement> arrangements = travelArrangementRepository.findByConsultantIdAndStatus(
                consultantId,
                TravelArrangementStatus.FINALIZED
        );
        return buildItineraryResponse(null, consultantId, arrangements);
    }

    public TravelArrangement findArrangement(Long travelArrangementId) {
        return travelArrangementRepository.findById(travelArrangementId)
                .orElseThrow(() -> new TravelArrangementNotFoundException("Travel arrangement not found"));
    }

    private TravelItineraryResponse buildItineraryResponse(Long seminarId, Long consultantId, List<TravelArrangement> arrangements) {
        List<TravelArrangement> sortedArrangements = sortArrangements(arrangements);
        List<TravelArrangementResponse> responses = sortedArrangements.stream()
                .map(TravelArrangementMapper::toResponse)
                .toList();
        BigDecimal totalCost = sortedArrangements.stream()
                .map(TravelArrangement::getCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long responseSeminarId = seminarId;
        if (responseSeminarId == null && !sortedArrangements.isEmpty()) {
            responseSeminarId = sortedArrangements.get(0).getSeminarId();
        }

        return new TravelItineraryResponse(
                responseSeminarId,
                consultantId,
                responses,
                totalCost,
                calculateOverallStatus(sortedArrangements)
        );
    }

    private TravelArrangementStatus calculateOverallStatus(List<TravelArrangement> arrangements) {
        if (arrangements.isEmpty()) {
            return TravelArrangementStatus.DRAFT;
        }
        if (arrangements.stream().allMatch(arrangement -> arrangement.getStatus() == TravelArrangementStatus.CANCELLED)) {
            return TravelArrangementStatus.CANCELLED;
        }
        if (arrangements.stream().anyMatch(arrangement -> arrangement.getStatus() == TravelArrangementStatus.DRAFT)) {
            return TravelArrangementStatus.DRAFT;
        }
        if (arrangements.stream().allMatch(arrangement -> arrangement.getStatus() == TravelArrangementStatus.FINALIZED)) {
            return TravelArrangementStatus.FINALIZED;
        }
        return TravelArrangementStatus.DRAFT;
    }

    private List<TravelArrangementResponse> toSortedResponses(List<TravelArrangement> arrangements) {
        return sortArrangements(arrangements).stream()
                .map(TravelArrangementMapper::toResponse)
                .toList();
    }

    private List<TravelArrangement> sortArrangements(List<TravelArrangement> arrangements) {
        return arrangements.stream()
                .sorted(Comparator.comparing(TravelArrangement::getDepartureTime))
                .toList();
    }

    private void validateArrangementData(TravelArrangement arrangement) {
        if (arrangement.getSeminarId() == null) {
            throw new InvalidTravelArrangementException("seminarId is required");
        }
        if (arrangement.getConsultantId() == null) {
            throw new InvalidTravelArrangementException("consultantId is required");
        }
        if (arrangement.getTransportMode() == null) {
            throw new InvalidTravelArrangementException("transportMode is required");
        }
        if (!hasText(arrangement.getDepartureLocation())) {
            throw new InvalidTravelArrangementException("departureLocation is required");
        }
        if (!hasText(arrangement.getArrivalLocation())) {
            throw new InvalidTravelArrangementException("arrivalLocation is required");
        }
        if (arrangement.getDepartureTime() == null) {
            throw new InvalidTravelArrangementException("departureTime is required");
        }
        if (arrangement.getArrivalTime() == null) {
            throw new InvalidTravelArrangementException("arrivalTime is required");
        }
        if (!arrangement.getArrivalTime().isAfter(arrangement.getDepartureTime())) {
            throw new InvalidTravelArrangementException("arrivalTime must be after departureTime");
        }
        if (arrangement.getCost() != null && arrangement.getCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidTravelArrangementException("cost must not be negative");
        }
    }

    private void requireDraft(TravelArrangement arrangement, String message) {
        if (arrangement.getStatus() != TravelArrangementStatus.DRAFT) {
            throw new InvalidTravelArrangementException(message);
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private Long parseCurrentUserId(String principal) {
        try {
            return Long.parseLong(principal);
        } catch (NumberFormatException ex) {
            throw new ForbiddenTravelAccessException("Current user id is invalid");
        }
    }

    private void sendTravelItineraryNotificationPlaceholder(TravelArrangement arrangement) {
        // TODO: integrate notification module to send Travel Itinerary Information to the consultant.
    }
}
