package com.training.logistics.materialrequest.dto.request;

import com.training.logistics.materialrequest.model.ShipmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateShipmentStatusRequest(
        @NotNull ShipmentStatus shipmentStatus
) {
}
