package com.training.logistics.facility_contract.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FacilityCreateRequest {
    @NotBlank
    @Size(max = 150)
    private String facilityName;

    @NotBlank
    @Size(max = 255)
    private String address;

    @NotBlank
    @Size(max = 100)
    private String city;

    @Size(max = 20)
    private String phone;

    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 100)
    private String salesManagerName;

    @Size(max = 20)
    private String salesManagerPhone;

    @Email
    @Size(max = 150)
    private String salesManagerEmail;

    @Min(0)
    private Integer numberOfRoom;

    @Min(0)
    private BigDecimal costForEachDay;
}
