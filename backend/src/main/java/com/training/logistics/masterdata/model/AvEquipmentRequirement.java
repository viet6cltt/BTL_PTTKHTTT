package com.training.logistics.masterdata.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "av_equipment_requirement")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class AvEquipmentRequirement {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private AvEquipmentRequirementId id = new AvEquipmentRequirementId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("equipmentId")
    @JoinColumn(name = "equipment_id")
    @ToString.Exclude
    private AudioVisualEquipment audioVisualEquipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("seminarTypeId")
    @JoinColumn(name = "seminar_type_id")
    @ToString.Exclude
    private SeminarType seminarType;

    @Column(name = "quantity_required")
    private Integer quantityRequired;

    @Column(name = "is_depend_on_num_participant")
    private Boolean dependOnNumParticipant;

    @Column(name = "participant_per_quantity")
    private Integer participantPerQuantity;
}
