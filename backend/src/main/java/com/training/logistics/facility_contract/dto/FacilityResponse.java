package com.training.logistics.facility_contract.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class FacilityResponse {
    private Long facilityId;
    private String facilityName;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String salesManagerName;
    private String salesManagerPhone;
    private String salesManagerEmail;
    private Integer numberOfRoom;
    private BigDecimal costForEachDay;
}
