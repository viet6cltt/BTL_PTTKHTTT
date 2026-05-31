package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.CreateFacilityContractRequest;
import com.training.logistics.facility_contract.dto.FacilityContractResponse;
import com.training.logistics.facility_contract.dto.RejectFacilityContractRequest;
import com.training.logistics.facility_contract.exception.DuplicateFacilityContractException;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.exception.InvalidFacilityContractRequestException;
import com.training.logistics.facility_contract.external.MasterDataClient;
import com.training.logistics.facility_contract.external.SeminarClient;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.Facility;
import com.training.logistics.facility_contract.model.FacilityRoomReservation;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.FacilityRoomReservationRepository;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FacilityContractService {
    private static final Set<ContractStatus> ACTIVE_CONTRACT_STATUSES = Set.of(
            ContractStatus.PENDING_NEGOTIATE,
            ContractStatus.APPROVED
    );

    private final SeminarFacilityContractRepository contractRepository;
    private final FacilityService facilityService;
    private final SeminarClient seminarClient;
    private final MasterDataClient masterDataClient;
    private final MinioStorageService minioStorageService;
    private final FacilityRoomReservationRepository roomReservationRepository;

    @Transactional
    public FacilityContractResponse createContract(CreateFacilityContractRequest request) {
        if (!seminarClient.existsSeminarById(request.getSeminarId())) {
            throw new InvalidFacilityContractRequestException("Seminar does not exist");
        }
        if (contractRepository.existsBySeminarIdAndStatusIn(request.getSeminarId(), ACTIVE_CONTRACT_STATUSES)) {
            throw new DuplicateFacilityContractException("Seminar already has an active facility contract");
        }

        Facility facility = facilityService.findFacility(request.getFacilityId());
        SeminarFacilityContract contract = SeminarFacilityContract.builder()
                .seminarId(request.getSeminarId())
                .facility(facility)
                .status(ContractStatus.PENDING_NEGOTIATE)
                .build();

        return FacilityContractMapper.toFacilityContractResponse(contractRepository.save(contract));
    }

    @Transactional(readOnly = true)
    public FacilityContractResponse getContractById(Long contractId) {
        return FacilityContractMapper.toFacilityContractResponse(findContract(contractId));
    }

    @Transactional
    public FacilityContractResponse approveContract(Long contractId, MultipartFile file, BigDecimal totalCost, String notes) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFacilityContractRequestException("Contract file is required");
        }
        if (totalCost == null || totalCost.signum() < 0) {
            throw new InvalidFacilityContractRequestException("totalCost must be zero or positive");
        }

        SeminarFacilityContract contract = findContract(contractId);
        if (contract.getStatus() != ContractStatus.PENDING_NEGOTIATE) {
            throw new InvalidFacilityContractRequestException("Only PENDING_NEGOTIATE contracts can be approved");
        }
        validateReservedRoomsCoverRegistrants(contract);

        String objectName = "contracts/" + contractId + "/" + System.currentTimeMillis() + "_" + safeFilename(file.getOriginalFilename());
        String fileUrl = minioStorageService.uploadFile(objectName, file);

        contract.setStatus(ContractStatus.APPROVED);
        contract.setTotalCost(totalCost);
        contract.setNotes(notes);
        contract.setContractCreatedTime(LocalDateTime.now());
        contract.setContractDocPath(fileUrl);

        seminarClient.markFacilitySecured(contract.getSeminarId());
        return FacilityContractMapper.toFacilityContractResponse(contract);
    }

    @Transactional
    public FacilityContractResponse rejectContract(Long contractId, RejectFacilityContractRequest request) {
        SeminarFacilityContract contract = findContract(contractId);
        if (contract.getStatus() == ContractStatus.APPROVED) {
            throw new InvalidFacilityContractRequestException("Approved contracts cannot be rejected");
        }

        contract.setStatus(ContractStatus.REJECTED);
        contract.setNotes(request.getNotes().trim());
        return FacilityContractMapper.toFacilityContractResponse(contract);
    }

    public SeminarFacilityContract findContract(Long contractId) {
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Facility contract not found"));
    }

    private void validateReservedRoomsCoverRegistrants(SeminarFacilityContract contract) {
        Optional<Integer> anticipatedRegistrants = seminarClient.getAnticipatedRegistrants(contract.getSeminarId());
        if (anticipatedRegistrants.isEmpty()) {
            return;
        }

        int totalSeats = roomReservationRepository.findByContractContractId(contract.getContractId()).stream()
                .map(FacilityRoomReservation::getNumSeats)
                .filter(seats -> seats != null && seats >= 0)
                .mapToInt(Integer::intValue)
                .sum();

        if (totalSeats < anticipatedRegistrants.get()) {
            throw new InvalidFacilityContractRequestException(
                    "Total reserved room seats must cover anticipated registrants: " + anticipatedRegistrants.get()
            );
        }
    }

    private String safeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "contract.pdf";
        }
        return originalFilename.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
