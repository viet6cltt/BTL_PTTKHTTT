package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.AvEquipmentReservation;
import com.training.logistics.facility_contract.model.AvEquipmentReservationId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvEquipmentReservationRepository extends JpaRepository<AvEquipmentReservation, AvEquipmentReservationId> {
    List<AvEquipmentReservation> findByContractContractId(Long contractId);
}
