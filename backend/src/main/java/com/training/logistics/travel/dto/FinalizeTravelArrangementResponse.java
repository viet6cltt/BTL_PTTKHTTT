package com.training.logistics.travel.dto;

import com.training.logistics.travel.model.TravelArrangementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FinalizeTravelArrangementResponse {
    private Long travelArrangementId;
    private Long seminarId;
    private Long consultantId;
    private TravelArrangementStatus status;
    private LocalDateTime finalizedAt;
    private LocalDateTime notificationSentAt;
    private String message;
}
