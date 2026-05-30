package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.AudioVisualEquipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AudioVisualEquipmentRepository extends JpaRepository<AudioVisualEquipment, Long> {
    List<AudioVisualEquipment> findByEquipmentNameContainingIgnoreCase(String name);
}
