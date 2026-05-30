package com.training.logistics.facility_contract.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "av_equipment_requirements")
@IdClass(AvEquipmentRequirementId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvEquipmentRequirement {
    @Id
    @Column(name = "seminar_type_id")
    private Long seminarTypeId;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private AudioVisualEquipment equipment;

    @Column(name = "quantity_required", nullable = false)
    private Integer quantityRequired;

    @Column(name = "is_depend_on_num_participant")
    private Boolean isDependOnNumParticipant;

    @Column(name = "participant_per_quantity")
    private Integer participantPerQuantity;
}
