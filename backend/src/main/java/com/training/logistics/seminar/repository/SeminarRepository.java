package com.training.logistics.seminar.repository;

import com.training.logistics.seminar.model.Seminar;
import com.training.logistics.seminar.model.SeminarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Collection;

public interface SeminarRepository extends JpaRepository<Seminar, Long>, JpaSpecificationExecutor<Seminar> {

    boolean existsByConsultantConsultantId(Long consultantId);

    boolean existsBySeminarType_Id(Long seminarTypeId);

    boolean existsByConsultantConsultantIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long consultantId,
            LocalDate endDate,
            LocalDate startDate
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Seminar seminar
            set seminar.status = com.training.logistics.seminar.model.SeminarStatus.OVERDUE
            where seminar.startDate < :today
              and seminar.status not in :excludedStatuses
            """)
    int markOverdueSeminars(LocalDate today, Collection<SeminarStatus> excludedStatuses);
}
