package com.training.logistics.travel.controller;

import com.training.logistics.travel.dto.CreateTravelArrangementRequest;
import com.training.logistics.travel.dto.TravelArrangementResponse;
import com.training.logistics.travel.dto.TravelItineraryResponse;
import com.training.logistics.travel.dto.UpdateTravelArrangementRequest;
import com.training.logistics.travel.dto.UpdateTravelArrangementStatusRequest;
import com.training.logistics.travel.model.TravelArrangementStatus;
import com.training.logistics.travel.service.TravelArrangementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/travel-arrangements")
@RequiredArgsConstructor
public class TravelArrangementController {
    private final TravelArrangementService travelArrangementService;

    @PostMapping
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<TravelArrangementResponse> createTravelArrangement(
            @Valid @RequestBody CreateTravelArrangementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(travelArrangementService.createTravelArrangement(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<TravelArrangementResponse>> getAllTravelArrangements() {
        return ResponseEntity.ok(travelArrangementService.getAllTravelArrangements());
    }

    @GetMapping("/{travelArrangementId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR', 'CONSULTANT')")
    public ResponseEntity<TravelArrangementResponse> getTravelArrangementById(@PathVariable Long travelArrangementId) {
        return ResponseEntity.ok(travelArrangementService.getTravelArrangementById(travelArrangementId));
    }

    @GetMapping("/by-seminar/{seminarId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<TravelArrangementResponse>> getTravelArrangementsBySeminar(@PathVariable Long seminarId) {
        return ResponseEntity.ok(travelArrangementService.getTravelArrangementsBySeminar(seminarId));
    }

    @GetMapping("/by-consultant/{consultantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<TravelArrangementResponse>> getTravelArrangementsByConsultant(@PathVariable Long consultantId) {
        return ResponseEntity.ok(travelArrangementService.getTravelArrangementsByConsultant(consultantId));
    }

    @GetMapping("/itinerary")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<TravelItineraryResponse> getTravelItinerary(
            @RequestParam Long seminarId,
            @RequestParam Long consultantId) {
        return ResponseEntity.ok(travelArrangementService.getTravelItinerary(seminarId, consultantId));
    }

    @GetMapping("/my-itinerary")
    @PreAuthorize("hasRole('CONSULTANT')")
    public ResponseEntity<TravelItineraryResponse> getMyTravelItinerary(
            @RequestParam(required = false) TravelArrangementStatus status) {
        return ResponseEntity.ok(travelArrangementService.getMyTravelItineraryForCurrentConsultant(status));
    }

    @PutMapping("/{travelArrangementId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<TravelArrangementResponse> updateTravelArrangement(
            @PathVariable Long travelArrangementId,
            @Valid @RequestBody UpdateTravelArrangementRequest request) {
        return ResponseEntity.ok(travelArrangementService.updateTravelArrangement(travelArrangementId, request));
    }

    @PutMapping("/{travelArrangementId}/status")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'CONSULTANT')")
    public ResponseEntity<TravelArrangementResponse> updateTravelArrangementStatus(
            @PathVariable Long travelArrangementId,
            @Valid @RequestBody UpdateTravelArrangementStatusRequest request) {
        return ResponseEntity.ok(travelArrangementService.updateTravelArrangementStatus(travelArrangementId, request));
    }

    @DeleteMapping("/{travelArrangementId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<Void> deleteTravelArrangement(@PathVariable Long travelArrangementId) {
        travelArrangementService.deleteTravelArrangement(travelArrangementId);
        return ResponseEntity.noContent().build();
    }
}
