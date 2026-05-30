package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.FacilityRoomReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacilityRoomReservationRepository extends JpaRepository<FacilityRoomReservation, Long> {
    List<FacilityRoomReservation> findByContractContractId(Long contractId);
}
