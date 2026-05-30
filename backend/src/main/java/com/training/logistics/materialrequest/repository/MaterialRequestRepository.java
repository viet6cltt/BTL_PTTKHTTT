package com.training.logistics.materialrequest.repository;

import com.training.logistics.materialrequest.model.MaterialRequest;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {

    @EntityGraph(attributePaths = {"seminar", "items"})
    List<MaterialRequest> findAllByOrderByCreatedAtDescIdDesc();

    @EntityGraph(attributePaths = {"seminar", "items"})
    List<MaterialRequest> findBySeminar_IdOrderByCreatedAtDescIdDesc(Long seminarId);
}
