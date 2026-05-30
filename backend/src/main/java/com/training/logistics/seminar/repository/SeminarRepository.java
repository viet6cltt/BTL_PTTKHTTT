package com.training.logistics.seminar.repository;

import com.training.logistics.seminar.model.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeminarRepository extends JpaRepository<Seminar, Long> {

    boolean existsByConsultant_Id(Long consultantId);

    boolean existsBySeminarType_Id(Long seminarTypeId);
}
