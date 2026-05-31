package com.training.logistics.seminar.repository;

import com.training.logistics.seminar.model.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;

public interface SeminarRepository extends JpaRepository<Seminar, Long>, JpaSpecificationExecutor<Seminar> {

    boolean existsByConsultantConsultantId(Long consultantId);

    boolean existsBySeminarType_Id(Long seminarTypeId);

    boolean existsByConsultantConsultantIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long consultantId,
            LocalDate endDate,
            LocalDate startDate
    );
}
