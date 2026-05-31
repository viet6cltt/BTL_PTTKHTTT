package com.training.logistics.travel.repository;

import com.training.logistics.travel.model.Consultant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ConsultantRepository extends JpaRepository<Consultant, Long>, JpaSpecificationExecutor<Consultant> {
    Optional<Consultant> findByUserUserId(Long userId);

    boolean existsByUserUserId(Long userId);
}
