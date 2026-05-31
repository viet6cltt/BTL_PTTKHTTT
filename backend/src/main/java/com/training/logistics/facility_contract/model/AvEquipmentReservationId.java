package com.training.logistics.facility_contract.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvEquipmentReservationId implements Serializable {
    private Long contract;
    private Long equipmentId;
}
