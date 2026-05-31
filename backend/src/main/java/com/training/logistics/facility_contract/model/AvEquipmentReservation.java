package com.training.logistics.facility_contract.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "av_equipment_reservations")
@IdClass(AvEquipmentReservationId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvEquipmentReservation {
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private SeminarFacilityContract contract;

    @Id
    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved;

    @Column(name = "cost_for_each_equipment", precision = 15, scale = 2)
    private BigDecimal costForEachEquipment;
}
