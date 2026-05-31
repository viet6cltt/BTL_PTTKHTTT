package com.training.logistics.materialrequest.repository;

import com.training.logistics.materialrequest.model.MaterialRequestItem;
import com.training.logistics.materialrequest.model.MaterialRequestItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRequestItemRepository extends JpaRepository<MaterialRequestItem, MaterialRequestItemId> {
}
