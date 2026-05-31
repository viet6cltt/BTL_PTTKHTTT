package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.FacilityCreateRequest;
import com.training.logistics.facility_contract.dto.FacilityResponse;
import com.training.logistics.facility_contract.dto.FacilitySearchRequest;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.external.SeminarClient;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.Facility;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.FacilityRepository;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FacilityService {
    private static final Set<ContractStatus> BLOCKING_STATUSES = Set.of(
            ContractStatus.PENDING_NEGOTIATE,
            ContractStatus.APPROVED
    );

    private final FacilityRepository facilityRepository;
    private final SeminarFacilityContractRepository contractRepository;
    private final SeminarClient seminarClient;

    @Transactional
    public FacilityResponse createFacility(FacilityCreateRequest request) {
        Facility facility = Facility.builder().build();
        applyFacilityRequest(facility, request);
        return FacilityContractMapper.toFacilityResponse(facilityRepository.save(facility));
    }

    @Transactional
    public FacilityResponse updateFacility(Long facilityId, FacilityCreateRequest request) {
        Facility facility = findFacility(facilityId);
        applyFacilityRequest(facility, request);
        return FacilityContractMapper.toFacilityResponse(facility);
    }

    @Transactional(readOnly = true)
    public FacilityResponse getFacilityById(Long facilityId) {
        return FacilityContractMapper.toFacilityResponse(findFacility(facilityId));
    }

    @Transactional(readOnly = true)
    public Page<FacilityResponse> searchFacilities(FacilitySearchRequest request) {
        Specification<Facility> specification = buildSpecification(request);
        List<Facility> filtered = facilityRepository.findAll(specification).stream()
                .filter(facility -> isAvailableForRequestedSlot(facility, request.getDate(), request.getTimeSlot()))
                .toList();

        int normalizedPage = Math.max(request.getPage(), 0);
        int normalizedSize = request.getSize() < 1 ? 20 : request.getSize();
        int start = Math.min(normalizedPage * normalizedSize, filtered.size());
        int end = Math.min(start + normalizedSize, filtered.size());

        List<FacilityResponse> content = filtered.subList(start, end).stream()
                .map(FacilityContractMapper::toFacilityResponse)
                .toList();

        return new PageImpl<>(content, PageRequest.of(normalizedPage, normalizedSize), filtered.size());
    }

    public Facility findFacility(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Facility not found"));
    }

    private Specification<Facility> buildSpecification(FacilitySearchRequest request) {
        Specification<Facility> specification = (root, query, builder) -> builder.conjunction();

        if (hasText(request.getCity())) {
            String cityPattern = "%" + request.getCity().trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, builder) ->
                    builder.like(builder.lower(root.get("city")), cityPattern));
        }

        if (request.getCapacity() != null) {
            specification = specification.and((root, query, builder) ->
                    builder.greaterThanOrEqualTo(root.get("maxCapacity"), request.getCapacity()));
        }

        return specification;
    }

    private boolean isAvailableForRequestedSlot(Facility facility, LocalDate date, String timeSlot) {
        if (date == null || !hasText(timeSlot)) {
            return true;
        }

        List<SeminarFacilityContract> relatedContracts = contractRepository.findByFacilityFacilityIdAndStatusIn(
                facility.getFacilityId(),
                BLOCKING_STATUSES
        );

        String normalizedSlot = timeSlot.trim().toUpperCase(Locale.ROOT);
        return relatedContracts.stream().noneMatch(contract -> seminarClient.getSeminarSchedule(contract.getSeminarId())
                .map(schedule -> !date.isBefore(schedule.startDate())
                        && !date.isAfter(schedule.endDate())
                        && normalizedSlot.equalsIgnoreCase(schedule.expectedTimeSlot()))
                .orElse(false));
    }

    private void applyFacilityRequest(Facility facility, FacilityCreateRequest request) {
        facility.setFacilityName(request.getFacilityName().trim());
        facility.setAddress(request.getAddress().trim());
        facility.setCity(request.getCity().trim());
        facility.setMaxCapacity(request.getMaxCapacity());
        facility.setSalesManagerName(trim(request.getSalesManagerName()));
        facility.setSalesManagerPhone(trim(request.getSalesManagerPhone()));
        facility.setSalesManagerEmail(trim(request.getSalesManagerEmail()));
        facility.setNumberOfRoom(request.getNumberOfRoom());
        facility.setCostForEachDay(request.getCostForEachDay());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
