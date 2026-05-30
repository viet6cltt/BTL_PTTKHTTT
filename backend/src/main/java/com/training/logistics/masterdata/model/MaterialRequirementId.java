package com.training.logistics.masterdata.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MaterialRequirementId implements Serializable {

    @Column(name = "seminar_type_id")
    private Long seminarTypeId;

    @Column(name = "material_id")
    private Long materialId;
}
