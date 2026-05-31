package com.training.logistics.travel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "travel_arrangements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelArrangement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "travel_arrangement_id")
    private Long travelArrangementId;

    @Column(name = "seminar_id", nullable = false)
    private Long seminarId;

    @Column(name = "consultant_id", nullable = false)
    private Long consultantId;

    @Column(name = "travel_agency_name", length = 255)
    private String travelAgencyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_mode", nullable = false, length = 50)
    private TransportMode transportMode;

    @Column(name = "carrier_name", length = 255)
    private String carrierName;

    @Column(name = "service_number", length = 100)
    private String serviceNumber;

    @Column(name = "departure_location", nullable = false, length = 255)
    private String departureLocation;

    @Column(name = "arrival_location", nullable = false, length = 255)
    private String arrivalLocation;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "seat_info", length = 255)
    private String seatInfo;

    @Column(precision = 15, scale = 2)
    private BigDecimal cost;

    @Column(name = "confirmation_sent_datetime")
    private LocalDateTime confirmationSentDatetime;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "travel_arrangement_status", nullable = false, length = 50)
    private TravelArrangementStatus travelArrangementStatus = TravelArrangementStatus.BOOKED;
}
