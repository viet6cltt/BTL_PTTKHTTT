package com.training.logistics.travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConsultantResponse {
    private Long consultantId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String specialty;
    private String travelPreference;
    private String address;
    private String city;
    private String country;
}
