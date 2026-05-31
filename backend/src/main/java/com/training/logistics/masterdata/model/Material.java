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
@Table(name = "material")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "material_id")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "material_name")
    private String materialName;

    @Column(name = "material_type")
    private String materialType;

    @Column(name = "description")
    private String description;

    @Column(name = "unit")
    private String unit;

    @JsonIgnore
    @OneToMany(mappedBy = "material", fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<MaterialRequirement> materialRequirements = new HashSet<>();
}
