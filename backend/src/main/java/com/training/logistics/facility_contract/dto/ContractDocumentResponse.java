package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ContractDocumentResponse {
    private Long documentId;
    private Long contractId;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private LocalDateTime uploadedAt;
    private String notes;
}
