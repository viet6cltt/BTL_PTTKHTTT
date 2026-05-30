package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.ContractDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContractDocumentRepository extends JpaRepository<ContractDocument, Long> {
    Optional<ContractDocument> findByContractContractId(Long contractId);
}
