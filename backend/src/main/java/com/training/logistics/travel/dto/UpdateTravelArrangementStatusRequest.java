package com.training.logistics.travel.dto;

import com.training.logistics.travel.model.TravelArrangementStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTravelArrangementStatusRequest {
    @NotNull
    private TravelArrangementStatus status;
}
