package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CreateRoomReservationRequest {
    @NotNull
    private Long contractId;

    @NotBlank
    private String roomNameSpec;

    private String seatingArrangement;

    @NotNull
    @PositiveOrZero
    private Integer numSeats;

    private MultipartFile roomImage;
}
