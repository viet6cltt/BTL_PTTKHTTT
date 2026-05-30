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
@Table(name = "material_requirement")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class MaterialRequirement {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private MaterialRequirementId id = new MaterialRequirementId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("seminarTypeId")
    @JoinColumn(name = "seminar_type_id")
    @ToString.Exclude
    private SeminarType seminarType;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materialId")
    @JoinColumn(name = "material_id")
    @ToString.Exclude
    private Material material;

    @Column(name = "default_quantity")
    private Integer defaultQuantity;

    @Column(name = "is_depend_on_num_participant")
    private Boolean dependOnNumParticipant;

    @Column(name = "participant_per_quantity")
    private Integer participantPerQuantity;

    @Column(name = "notes")
    private String notes;
}
