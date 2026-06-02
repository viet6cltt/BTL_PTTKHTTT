package com.training.logistics.travel.service;

import com.training.logistics.auth.model.User;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.travel.dto.ConsultantResponse;
import com.training.logistics.travel.dto.UpdateConsultantProfileRequest;
import com.training.logistics.travel.dto.UpdateMyConsultantProfileRequest;
import com.training.logistics.travel.exception.ForbiddenTravelAccessException;
import com.training.logistics.travel.exception.TravelArrangementNotFoundException;
import com.training.logistics.travel.model.Consultant;
import com.training.logistics.travel.repository.ConsultantRepository;
import com.training.logistics.facility_contract.service.MinioStorageService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ConsultantService {
    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;
    private final MinioStorageService minioStorageService;

    @Transactional
    public ConsultantResponse createBlankProfile(Long userId) {
        if (consultantRepository.existsByUserUserId(userId)) {
            return toResponse(consultantRepository.findByUserUserId(userId).orElseThrow());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new TravelArrangementNotFoundException("User not found"));
        Consultant consultant = Consultant.builder()
                .user(user)
                .build();
        return toResponse(consultantRepository.save(consultant));
    }

    @Transactional(readOnly = true)
    public Page<ConsultantResponse> searchConsultants(String specialty, String city, Pageable pageable) {
        return consultantRepository.findAll(buildSpecification(specialty, city), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ConsultantResponse getConsultantById(Long consultantId) {
        Consultant consultant = findConsultant(consultantId);
        ensureCanViewConsultant(consultant);
        return toResponse(consultant);
    }

    @Transactional
    public ConsultantResponse getConsultantByUserId(Long userId) {
        return consultantRepository.findByUserUserId(userId)
                .map(this::toResponse)
                .orElseGet(() -> createBlankProfile(userId));
    }

    @Transactional
    public ConsultantResponse updateMyProfile(UpdateMyConsultantProfileRequest request) {
        Consultant consultant = consultantRepository.findByUserUserId(getCurrentUserId())
                .orElseThrow(() -> new ForbiddenTravelAccessException("Current user is not linked to a consultant profile"));
        consultant.setTravelPreference(trim(request.getTravelPreference()));
        consultant.setAddress(trim(request.getAddress()));
        consultant.setCity(trim(request.getCity()));
        consultant.setCountry(trim(request.getCountry()));
        return toResponse(consultant);
    }

    @Transactional
    public ConsultantResponse updateConsultant(Long consultantId, UpdateConsultantProfileRequest request) {
        Consultant consultant = findConsultant(consultantId);
        consultant.setSpecialty(trim(request.getSpecialty()));
        consultant.setTravelPreference(trim(request.getTravelPreference()));
        consultant.setAddress(trim(request.getAddress()));
        consultant.setCity(trim(request.getCity()));
        consultant.setCountry(trim(request.getCountry()));
        if (request.getAvatarUrl() != null) {
            consultant.setAvatarUrl(trim(request.getAvatarUrl()));
        }
        return toResponse(consultant);
    }

    private Consultant findConsultant(Long consultantId) {
        return consultantRepository.findById(consultantId)
                .orElseThrow(() -> new TravelArrangementNotFoundException("Consultant not found"));
    }

    private Specification<Consultant> buildSpecification(String specialty, String city) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (hasText(specialty)) {
                predicates.add(builder.like(builder.lower(root.get("specialty")), "%" + specialty.trim().toLowerCase() + "%"));
            }
            if (hasText(city)) {
                predicates.add(builder.like(builder.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%"));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void ensureCanViewConsultant(Consultant consultant) {
        if (hasAnyRole("ROLE_ADMIN", "ROLE_LOGISTICS_COORDINATOR")) {
            return;
        }
        if (hasAnyRole("ROLE_CONSULTANT") && Objects.equals(consultant.getUser().getUserId(), getCurrentUserId())) {
            return;
        }
        throw new ForbiddenTravelAccessException("You cannot access this consultant profile");
    }

    private ConsultantResponse toResponse(Consultant consultant) {
        User user = consultant.getUser();
        return new ConsultantResponse(
                consultant.getConsultantId(),
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                consultant.getSpecialty(),
                consultant.getTravelPreference(),
                consultant.getAddress(),
                consultant.getCity(),
                consultant.getCountry(),
                consultant.getAvatarUrl()
        );
    }

    @Transactional
    public ConsultantResponse updateConsultantAvatar(Long consultantId, MultipartFile file) {
        Consultant consultant = findConsultant(consultantId);
        return updateAvatar(consultant, file);
    }

    private ConsultantResponse updateAvatar(Consultant consultant, MultipartFile file) {
        String filename = "avatar_" + consultant.getConsultantId() + "_" + System.currentTimeMillis();
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            filename += originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            filename += ".jpg";
        }
        
        String avatarUrl = minioStorageService.uploadFile(filename, file);
        consultant.setAvatarUrl(avatarUrl);
        return toResponse(consultantRepository.save(consultant));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenTravelAccessException("Authentication is required");
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new ForbiddenTravelAccessException("Current user id is invalid");
        }
    }

    private boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        List<String> roleList = List.of(roles);
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(roleList::contains);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
