package com.training.logistics.facility_contract.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facilities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "facility_name", nullable = false, length = 150)
    private String facilityName;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "sales_manager_name", length = 100)
    private String salesManagerName;

    @Column(name = "sales_manager_phone", length = 20)
    private String salesManagerPhone;

    @Column(name = "sales_manager_email", length = 150)
    private String salesManagerEmail;

    @Column(name = "number_of_room")
    private Integer numberOfRoom;

    @Column(name = "cost_for_each_day", precision = 15, scale = 2)
    private BigDecimal costForEachDay;

    @Builder.Default
    @OneToMany(mappedBy = "facility", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeminarFacilityContract> contracts = new ArrayList<>();
}
