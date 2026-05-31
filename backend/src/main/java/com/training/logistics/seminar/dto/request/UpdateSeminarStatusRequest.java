package com.training.logistics.seminar.dto.request;

import com.training.logistics.seminar.model.SeminarStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSeminarStatusRequest(
        @NotNull SeminarStatus status
) {
}
