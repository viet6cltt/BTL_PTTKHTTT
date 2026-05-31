package com.training.logistics.facility_contract.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class FacilitySearchRequest {
    private String city;
    private Integer capacity;
    private LocalDate date;
    private String timeSlot;
    private int page = 0;
    private int size = 20;
}
