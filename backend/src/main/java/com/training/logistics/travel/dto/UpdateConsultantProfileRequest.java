package com.training.logistics.travel.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateConsultantProfileRequest {
    @Size(max = 255)
    private String specialty;

    private String travelPreference;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String country;
}
