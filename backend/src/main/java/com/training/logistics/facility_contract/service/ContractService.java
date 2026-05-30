package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.ContractResponse;
import com.training.logistics.facility_contract.dto.CreateContractRequest;
import com.training.logistics.facility_contract.dto.FinalContractSummaryResponse;
import com.training.logistics.facility_contract.dto.UpdateContractRequest;
import com.training.logistics.facility_contract.exception.DuplicateFacilityContractException;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.exception.InvalidFacilityContractRequestException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.ContractDocument;
import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.Facility;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {
    private final SeminarFacilityContractRepository contractRepository;
    private final FacilityService facilityService;
    private final ContractDocumentService contractDocumentService;

    @Transactional
    public ContractResponse createContract(CreateContractRequest request) {
        if (contractRepository.existsBySeminarId(request.getSeminarId())) {
            throw new DuplicateFacilityContractException("Seminar already has a facility contract");
        }

        Facility facility = facilityService.findFacility(request.getFacilityId());
        SeminarFacilityContract contract = SeminarFacilityContract.builder()
                .seminarId(request.getSeminarId())
                .facility(facility)
                .reservationDate(request.getReservationDate())
                .status(request.getStatus() == null ? ContractStatus.NOTSIGNED : request.getStatus())
                .totalCost(request.getTotalCost())
                .build();
        validateSignedContract(contract.getStatus(), contract.getContractCreatedDate(), contract.getTotalCost());
        return FacilityContractMapper.toContractResponse(contractRepository.save(contract));
    }

    @Transactional
    public ContractResponse updateContract(Long contractId, UpdateContractRequest request) {
        SeminarFacilityContract contract = findContract(contractId);
        if (request.getFacilityId() != null) {
            contract.setFacility(facilityService.findFacility(request.getFacilityId()));
        }
        if (request.getReservationDate() != null) {
            contract.setReservationDate(request.getReservationDate());
        }
        if (request.getContractCreatedDate() != null) {
            contract.setContractCreatedDate(request.getContractCreatedDate());
        }
        if (request.getStatus() != null) {
            contract.setStatus(request.getStatus());
        }
        if (request.getTotalCost() != null) {
            contract.setTotalCost(request.getTotalCost());
        }
        validateSignedContract(contract.getStatus(), contract.getContractCreatedDate(), contract.getTotalCost());
        return FacilityContractMapper.toContractResponse(contract);
    }

    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long contractId) {
        return FacilityContractMapper.toContractResponse(findContract(contractId));
    }

    @Transactional(readOnly = true)
    public ContractResponse getContractBySeminarId(Long seminarId) {
        SeminarFacilityContract contract = contractRepository.findBySeminarId(seminarId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Contract not found"));
        return FacilityContractMapper.toContractResponse(contract);
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(FacilityContractMapper::toContractResponse)
                .toList();
    }

    @Transactional
    public void deleteContract(Long contractId) {
        SeminarFacilityContract contract = findContract(contractId);
        ContractDocument document = contract.getContractDocument();
        if (document != null) {
            contractDocumentService.deleteContractDocument(contractId);
        }
        contractRepository.delete(contract);
    }

    @Transactional
    public ContractResponse signContract(Long contractId, BigDecimal totalCost) {
        SeminarFacilityContract contract = findContract(contractId);
        contract.setStatus(ContractStatus.SIGNED);
        contract.setContractCreatedDate(LocalDate.now());
        contract.setTotalCost(totalCost);
        return FacilityContractMapper.toContractResponse(contract);
    }

    @Transactional(readOnly = true)
    public FinalContractSummaryResponse getFinalContractSummary(Long contractId) {
        return FacilityContractMapper.toFinalSummaryResponse(findContract(contractId));
    }

    public SeminarFacilityContract findContract(Long contractId) {
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Contract not found"));
    }

    private void validateSignedContract(ContractStatus status, LocalDate contractCreatedDate, BigDecimal totalCost) {
        if (status == ContractStatus.SIGNED && (contractCreatedDate == null || totalCost == null)) {
            throw new InvalidFacilityContractRequestException("SIGNED contract requires contractCreatedDate and totalCost");
        }
    }
}
