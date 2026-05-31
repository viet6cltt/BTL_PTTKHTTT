package com.training.logistics.seminar.model;

import com.training.logistics.auth.model.User;
import com.training.logistics.masterdata.model.SeminarType;
import com.training.logistics.travel.model.Consultant;
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
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "seminar")
@Data
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Seminar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seminar_id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seminar_type_id")
    @ToString.Exclude
    private SeminarType seminarType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    @ToString.Exclude
    private Consultant consultant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_department_user_id")
    @ToString.Exclude
    private User bookingDepartmentUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinator_user_id")
    @ToString.Exclude
    private User coordinator;

    @Column(name = "seminar_name", nullable = false, length = 255)
    private String seminarName;

    @Column(name = "expected_time_slot", nullable = false)
    @Enumerated(EnumType.STRING)
    private TimeSlot expectedTimeSlot;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SeminarStatus status = SeminarStatus.PENDING_LOGISTICS;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "anticipated_registrants", nullable = false)
    private Integer anticipatedRegistrants;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "booking_created_date_time", updatable = false)
    @CreationTimestamp
    private LocalDateTime bookingCreatedDateTime;
}
