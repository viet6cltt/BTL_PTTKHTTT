package com.training.logistics.masterdata.repository;

import com.training.logistics.masterdata.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {
}
