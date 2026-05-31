package com.training.logistics.travel.service;

import com.training.logistics.travel.dto.CreateTravelArrangementRequest;
import com.training.logistics.travel.dto.TravelArrangementResponse;
import com.training.logistics.travel.dto.TravelFacilityInfoResponse;
import com.training.logistics.travel.dto.TravelItineraryResponse;
import com.training.logistics.travel.dto.UpdateTravelArrangementRequest;
import com.training.logistics.travel.dto.UpdateTravelArrangementStatusRequest;
import com.training.logistics.travel.exception.ForbiddenTravelAccessException;
import com.training.logistics.travel.exception.InvalidTravelArrangementException;
import com.training.logistics.travel.exception.TravelArrangementNotFoundException;
import com.training.logistics.travel.external.FacilityContractClient;
import com.training.logistics.travel.mapper.TravelArrangementMapper;
import com.training.logistics.travel.model.TravelArrangement;
import com.training.logistics.travel.model.TravelArrangementStatus;
import com.training.logistics.travel.repository.ConsultantRepository;
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
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TravelArrangementService {
    private final TravelArrangementRepository travelArrangementRepository;
    private final ConsultantRepository consultantRepository;
    private final FacilityContractClient facilityContractClient;

    @Transactional
    public TravelArrangementResponse createTravelArrangement(CreateTravelArrangementRequest request) {
        TravelArrangement arrangement = TravelArrangementMapper.toEntity(request);
        validateArrangementData(arrangement);
        return TravelArrangementMapper.toResponse(travelArrangementRepository.save(arrangement));
    }

    @Transactional
    public TravelArrangementResponse updateTravelArrangement(Long travelArrangementId, UpdateTravelArrangementRequest request) {
        TravelArrangement arrangement = findArrangement(travelArrangementId);
        if (arrangement.getTravelArrangementStatus() == TravelArrangementStatus.CANCELLED) {
            throw new InvalidTravelArrangementException("Cancelled travel arrangements cannot be updated");
        }

        TravelArrangementMapper.updateEntityFromRequest(request, arrangement);
        validateArrangementData(arrangement);
        return TravelArrangementMapper.toResponse(arrangement);
    }

    @Transactional
    public TravelArrangementResponse updateTravelArrangementStatus(Long travelArrangementId, UpdateTravelArrangementStatusRequest request) {
        TravelArrangement arrangement = findArrangement(travelArrangementId);
        ensureCanChangeArrangementStatus(arrangement);
        TravelArrangementStatus newStatus = request.getStatus();
        validateStatusTransition(arrangement, newStatus);

        arrangement.setTravelArrangementStatus(newStatus);
        if (newStatus == TravelArrangementStatus.CONFIRMED) {
            arrangement.setConfirmationSentDatetime(LocalDateTime.now());
        }

        return TravelArrangementMapper.toResponse(arrangement);
    }

    @Transactional
    public void deleteTravelArrangement(Long travelArrangementId) {
        travelArrangementRepository.delete(findArrangement(travelArrangementId));
    }

    @Transactional(readOnly = true)
    public TravelArrangementResponse getTravelArrangementById(Long travelArrangementId) {
        TravelArrangement arrangement = findArrangement(travelArrangementId);
        ensureCanViewArrangement(arrangement);
        return TravelArrangementMapper.toResponse(arrangement);
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
    public TravelItineraryResponse getTravelItinerary(Long seminarId, Long consultantId) {
        List<TravelArrangement> arrangements = travelArrangementRepository.findBySeminarIdAndConsultantId(seminarId, consultantId);
        return buildItineraryResponse(seminarId, consultantId, arrangements);
    }

    @Transactional(readOnly = true)
    public TravelItineraryResponse getMyTravelItineraryForCurrentConsultant(TravelArrangementStatus status) {
        Long consultantId = getCurrentConsultantId();
        List<TravelArrangement> arrangements = status == null
                ? travelArrangementRepository.findByConsultantId(consultantId)
                : travelArrangementRepository.findByConsultantIdAndTravelArrangementStatus(consultantId, status);
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
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long responseSeminarId = seminarId;
        if (responseSeminarId == null && !sortedArrangements.isEmpty()) {
            responseSeminarId = sortedArrangements.getFirst().getSeminarId();
        }

        List<TravelFacilityInfoResponse> facilityReservations = sortedArrangements.stream()
                .map(TravelArrangement::getSeminarId)
                .distinct()
                .map(this::getFacilityInfo)
                .flatMap(Optional::stream)
                .toList();

        return new TravelItineraryResponse(
                responseSeminarId,
                consultantId,
                responses,
                facilityReservations,
                totalCost,
                calculateOverallStatus(sortedArrangements)
        );
    }

    private Optional<TravelFacilityInfoResponse> getFacilityInfo(Long seminarId) {
        return facilityContractClient.getReservationSnapshotBySeminarId(seminarId)
                .map(snapshot -> new TravelFacilityInfoResponse(
                        snapshot.seminarId(),
                        snapshot.facilityName(),
                        snapshot.facilityAddress(),
                        snapshot.roomNameSpecs()
                ));
    }

    private TravelArrangementStatus calculateOverallStatus(List<TravelArrangement> arrangements) {
        if (arrangements.isEmpty()) {
            return TravelArrangementStatus.BOOKED;
        }
        if (arrangements.stream().allMatch(arrangement -> arrangement.getTravelArrangementStatus() == TravelArrangementStatus.CANCELLED)) {
            return TravelArrangementStatus.CANCELLED;
        }
        if (arrangements.stream().allMatch(arrangement -> arrangement.getTravelArrangementStatus() == TravelArrangementStatus.CONFIRMED)) {
            return TravelArrangementStatus.CONFIRMED;
        }
        return TravelArrangementStatus.BOOKED;
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

    private void validateStatusTransition(TravelArrangement arrangement, TravelArrangementStatus newStatus) {
        if (newStatus == TravelArrangementStatus.BOOKED) {
            throw new InvalidTravelArrangementException("Status can only be changed to CONFIRMED or CANCELLED");
        }
        if (arrangement.getTravelArrangementStatus() == TravelArrangementStatus.CANCELLED) {
            throw new InvalidTravelArrangementException("Cancelled travel arrangements cannot change status");
        }
    }

    private void ensureCanViewArrangement(TravelArrangement arrangement) {
        if (hasAnyRole("ROLE_ADMIN", "ROLE_LOGISTICS_COORDINATOR")) {
            return;
        }
        if (hasAnyRole("ROLE_CONSULTANT") && Objects.equals(arrangement.getConsultantId(), getCurrentConsultantId())) {
            return;
        }
        throw new ForbiddenTravelAccessException("You cannot access this travel arrangement");
    }

    private void ensureCanChangeArrangementStatus(TravelArrangement arrangement) {
        if (hasAnyRole("ROLE_LOGISTICS_COORDINATOR")) {
            return;
        }
        if (hasAnyRole("ROLE_CONSULTANT") && Objects.equals(arrangement.getConsultantId(), getCurrentConsultantId())) {
            return;
        }
        throw new ForbiddenTravelAccessException("You cannot change this travel arrangement status");
    }

    private Long getCurrentConsultantId() {
        Long userId = getCurrentUserId();
        return consultantRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ForbiddenTravelAccessException("Current user is not linked to a consultant profile"))
                .getConsultantId();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenTravelAccessException("Authentication is required");
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new ForbiddenTravelAccessException("Current user id is invalid");
        }
    }

    private boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        List<String> roleList = List.of(roles);
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(roleList::contains);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
