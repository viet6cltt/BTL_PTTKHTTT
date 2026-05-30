package com.training.logistics.materialrequest.dto.response;

import com.training.logistics.materialrequest.model.ShipmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MaterialRequestResponse(
        Long id,
        Long seminarId,
        String seminarName,
        Long contractId,
        LocalDate requestDate,
        LocalDate neededByDate,
        ShipmentStatus shipmentStatus,
        LocalDateTime deliveredConfirmedAt,
        String deliveryConfirmationNote,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<MaterialRequestItemResponse> items
) {
}
