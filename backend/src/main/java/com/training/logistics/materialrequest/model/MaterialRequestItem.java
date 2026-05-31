package com.training.logistics.materialrequest.model;

import com.training.logistics.masterdata.model.Material;
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
@Table(name = "material_request_item")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class MaterialRequestItem {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private MaterialRequestItemId id = new MaterialRequestItemId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materialRequestId")
    @JoinColumn(name = "material_request_id")
    @ToString.Exclude
    private MaterialRequest materialRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materialId")
    @JoinColumn(name = "material_id")
    @ToString.Exclude
    private Material material;

    @Column(name = "requested_quantity")
    private Integer requestedQuantity;

    @Column(name = "notes")
    private String notes;
}
