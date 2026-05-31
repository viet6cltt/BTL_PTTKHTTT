package com.training.logistics.facility_contract.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "facility_room_reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRoomReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_reservation_id")
    private Long roomReservationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private SeminarFacilityContract contract;

    @Column(name = "room_name_spec", nullable = false, length = 150)
    private String roomNameSpec;

    @Column(name = "seating_arrangement", length = 100)
    private String seatingArrangement;

    @Column(name = "num_seats", nullable = false)
    private Integer numSeats;

    @Column(name = "room_image_url", length = 500)
    private String roomImageUrl;
}
