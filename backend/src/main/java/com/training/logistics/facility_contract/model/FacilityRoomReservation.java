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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "facility_room_reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRoomReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private SeminarFacilityContract contract;

    @Column(name = "num_seats", nullable = false)
    private Integer numSeats;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "room_width", precision = 10, scale = 2)
    private BigDecimal roomWidth;

    @Column(name = "room_length", precision = 10, scale = 2)
    private BigDecimal roomLength;

    @Column(name = "seat_arrangement_notes", length = 500)
    private String seatArrangementNotes;

    @Column(name = "room_cost", precision = 15, scale = 2)
    private BigDecimal roomCost;
}
