package com.training.logistics.seminar.dto.response;

import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.materialrequest.model.ShipmentStatus;
import com.training.logistics.travel.model.TravelArrangementStatus;

public record SeminarPreparationChecklistResponse(
        ContractStatus facilityContractStatus,
        TravelArrangementStatus travelArrangementStatus,
        ShipmentStatus materialShipmentStatus,
        boolean facilitySecured,
        boolean travelConfirmed,
        boolean materialsDelivered,
        boolean readyForSeminar
) {
}
