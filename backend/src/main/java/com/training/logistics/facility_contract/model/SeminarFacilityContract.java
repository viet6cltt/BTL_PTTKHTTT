package com.training.logistics.facility_contract.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "seminar_facility_contracts",
        uniqueConstraints = @UniqueConstraint(name = "uk_seminar_facility_contracts_seminar", columnNames = "seminar_id")
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeminarFacilityContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    // TO DO: map to seminar entity when it is created, for now we just store seminarId
    @Column(name = "seminar_id", nullable = false)
    private Long seminarId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "contract_created_time")
    private LocalDateTime contractCreatedTime;

    @Column(name = "contract_doc_path", length = 500)
    private String contractDocPath;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ContractStatus status = ContractStatus.PENDING_NEGOTIATE;

    @Column(name = "total_cost", precision = 15, scale = 2)
    private BigDecimal totalCost;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvEquipmentReservation> avReservations = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FacilityRoomReservation> roomReservations = new ArrayList<>();
}
