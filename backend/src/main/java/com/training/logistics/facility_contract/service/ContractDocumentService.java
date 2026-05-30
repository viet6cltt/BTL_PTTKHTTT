package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.ContractDocumentResponse;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.exception.InvalidFacilityContractRequestException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.ContractDocument;
import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.ContractDocumentRepository;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ContractDocumentService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx");

    private final ContractDocumentRepository documentRepository;
    private final SeminarFacilityContractRepository contractRepository;
    private final MinioStorageService minioStorageService;

    @Transactional
    public ContractDocumentResponse uploadContractDocument(Long contractId, MultipartFile file, String notes, boolean markAsSigned) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFacilityContractRequestException("Contract file is required");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "contract" : file.getOriginalFilename());
        validateFile(originalFilename);

        SeminarFacilityContract contract = findContract(contractId);
        String objectName = "contracts/" + contractId + "/" + System.currentTimeMillis() + "_" + originalFilename;
        String fileUrl = minioStorageService.uploadFile(objectName, file);

        ContractDocument document = documentRepository.findByContractContractId(contractId).orElse(null);
        if (document == null) {
            document = ContractDocument.builder()
                    .contract(contract)
                    .build();
            contract.setContractDocument(document);
        } else {
            minioStorageService.deleteFile(document.getObjectName());
        }

        document.setFileName(originalFilename);
        document.setFileType(file.getContentType());
        document.setFileUrl(fileUrl);
        document.setObjectName(objectName);
        document.setUploadedAt(LocalDateTime.now());
        document.setNotes(notes);

        if (markAsSigned) {
            contract.setStatus(ContractStatus.SIGNED);
            contract.setContractCreatedDate(LocalDate.now());
        }

        return FacilityContractMapper.toDocumentResponse(documentRepository.save(document));
    }

    @Transactional(readOnly = true)
    public ContractDocumentResponse getContractDocument(Long contractId) {
        return FacilityContractMapper.toDocumentResponse(findDocumentByContractId(contractId));
    }

    @Transactional
    public void deleteContractDocument(Long contractId) {
        ContractDocument document = findDocumentByContractId(contractId);
        minioStorageService.deleteFile(document.getObjectName());
        SeminarFacilityContract contract = document.getContract();
        contract.setContractDocument(null);
        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public DownloadedContractDocument downloadContractDocument(Long contractId) {
        ContractDocument document = findDocumentByContractId(contractId);
        return new DownloadedContractDocument(
                document.getFileName(),
                document.getFileType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : document.getFileType(),
                new InputStreamResource(minioStorageService.downloadFile(document.getObjectName()))
        );
    }

    private SeminarFacilityContract findContract(Long contractId) {
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Contract not found"));
    }

    private ContractDocument findDocumentByContractId(Long contractId) {
        return documentRepository.findByContractContractId(contractId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Contract document not found"));
    }

    private void validateFile(String filename) {
        String extension = StringUtils.getFilenameExtension(filename);
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new InvalidFacilityContractRequestException("Contract file must be PDF, DOC, or DOCX");
        }
    }

    public record DownloadedContractDocument(String fileName, String contentType, InputStreamResource resource) {
    }
}
