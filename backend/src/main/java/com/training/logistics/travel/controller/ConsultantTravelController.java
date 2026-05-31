package com.training.logistics.travel.controller;

import com.training.logistics.travel.dto.TravelItineraryResponse;
import com.training.logistics.travel.service.TravelArrangementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/consultant")
@RequiredArgsConstructor
public class ConsultantTravelController {
    private final TravelArrangementService travelArrangementService;

    @GetMapping("/travel-itinerary")
    @PreAuthorize("hasRole('CONSULTANT')")
    public ResponseEntity<TravelItineraryResponse> getMyTravelItinerary() {
        return ResponseEntity.ok(travelArrangementService.getMyTravelItineraryForCurrentConsultant());
    }
}
