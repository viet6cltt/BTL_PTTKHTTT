package com.training.logistics.materialrequest.model;

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
public class MaterialRequestItemId implements Serializable {

    @Column(name = "material_request_id")
    private Long materialRequestId;

    @Column(name = "material_id")
    private Long materialId;
}
