package com.training.logistics.travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TravelFacilityInfoResponse {
    private Long seminarId;
    private String facilityName;
    private String facilityAddress;
    private List<String> roomNameSpecs;
}
