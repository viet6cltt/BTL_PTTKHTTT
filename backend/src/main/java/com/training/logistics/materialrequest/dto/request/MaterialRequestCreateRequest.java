package com.training.logistics.materialrequest.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record MaterialRequestCreateRequest(
        @NotNull LocalDate neededByDate,
        String notes,
        @Valid List<MaterialRequestItemRequest> items
) {
}
