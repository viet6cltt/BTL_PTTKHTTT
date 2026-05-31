package com.training.logistics.masterdata.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "seminar_type")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class SeminarType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seminar_type_id")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "type_name")
    private String typeName;

    @Column(name = "description")
    private String description;

    @Column(name = "duration")
    private Integer durationHours;

    @Column(name = "arrangement_notes")
    private String arrangementNotes;

    @JsonIgnore
    @OneToMany(mappedBy = "seminarType", fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<MaterialRequirement> materialRequirements = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "seminarType", fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<AvEquipmentRequirement> avEquipmentRequirements = new HashSet<>();
}
