package com.training.logistics.travel.repository;

import com.training.logistics.travel.model.TravelArrangement;
import com.training.logistics.travel.model.TravelArrangementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelArrangementRepository extends JpaRepository<TravelArrangement, Long> {
    List<TravelArrangement> findBySeminarId(Long seminarId);

    List<TravelArrangement> findByConsultantId(Long consultantId);

    List<TravelArrangement> findBySeminarIdAndConsultantId(Long seminarId, Long consultantId);

    List<TravelArrangement> findByTravelArrangementStatus(TravelArrangementStatus status);

    List<TravelArrangement> findByConsultantIdAndTravelArrangementStatus(Long consultantId, TravelArrangementStatus status);

    List<TravelArrangement> findBySeminarIdAndTravelArrangementStatus(Long seminarId, TravelArrangementStatus status);
}
