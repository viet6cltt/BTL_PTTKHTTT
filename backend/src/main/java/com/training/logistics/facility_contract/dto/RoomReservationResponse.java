package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoomReservationResponse {
    private Long roomReservationId;
    private Long contractId;
    private String roomNameSpec;
    private String seatingArrangement;
    private Integer numSeats;
    private String roomImageUrl;
}
