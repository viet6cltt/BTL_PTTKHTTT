package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.FacilityCreateRequest;
import com.training.logistics.facility_contract.dto.FacilityResponse;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.Facility;
import com.training.logistics.facility_contract.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {
    private final FacilityRepository facilityRepository;

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

    @Transactional
    public void deleteFacility(Long facilityId) {
        Facility facility = findFacility(facilityId);
        facilityRepository.delete(facility);
    }

    @Transactional(readOnly = true)
    public FacilityResponse getFacilityById(Long facilityId) {
        return FacilityContractMapper.toFacilityResponse(findFacility(facilityId));
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(FacilityContractMapper::toFacilityResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> searchFacilities(String city, String name) {
        List<Facility> facilities;
        if (hasText(city) && hasText(name)) {
            facilities = facilityRepository.findByCityContainingIgnoreCaseAndFacilityNameContainingIgnoreCase(city.trim(), name.trim());
        } else if (hasText(city)) {
            facilities = facilityRepository.findByCityContainingIgnoreCase(city.trim());
        } else if (hasText(name)) {
            facilities = facilityRepository.findByFacilityNameContainingIgnoreCase(name.trim());
        } else {
            facilities = facilityRepository.findAll();
        }
        return facilities.stream().map(FacilityContractMapper::toFacilityResponse).toList();
    }

    public Facility findFacility(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Facility not found"));
    }

    private void applyFacilityRequest(Facility facility, FacilityCreateRequest request) {
        facility.setFacilityName(request.getFacilityName().trim());
        facility.setAddress(request.getAddress().trim());
        facility.setCity(request.getCity().trim());
        facility.setPhone(trim(request.getPhone()));
        facility.setEmail(trim(request.getEmail()));
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
