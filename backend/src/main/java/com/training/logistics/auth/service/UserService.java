package com.training.logistics.auth.service;

import com.training.logistics.auth.dto.CreateUserRequest;
import com.training.logistics.auth.dto.UpdateUserRequest;
import com.training.logistics.auth.dto.UserResponse;
import com.training.logistics.auth.exception.UserAlreadyExistsException;
import com.training.logistics.auth.exception.UserNotFoundException;
import com.training.logistics.auth.model.User;
import com.training.logistics.auth.model.UserRole;
import com.training.logistics.auth.model.UserStatus;
import com.training.logistics.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String keyword, UserRole role, UserStatus status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return userRepository.findAll(buildSpecification(keyword, role, status), pageRequest)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return UserResponse.from(findUserById(id));
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .role(request.getRole() == null ? UserRole.BOOKING_STAFF : request.getRole())
                .status(request.getStatus() == null ? UserStatus.ACTIVE : request.getStatus())
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserById(id);

        if (hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }

        if (hasText(request.getEmail())) {
            String email = normalizeEmail(request.getEmail());
            if (userRepository.existsByEmailAndIdNot(email, id)) {
                throw new UserAlreadyExistsException("Email already exists");
            }
            user.setEmail(email);
        }

        if (hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (hasText(request.getPhone())) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, UserStatus status) {
        User user = findUserById(id);
        user.setStatus(status);
        return UserResponse.from(user);
    }

    @Transactional
    public void disableUser(Long id) {
        User user = findUserById(id);
        user.setStatus(UserStatus.DISABLED);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private Specification<User> buildSpecification(String keyword, UserRole role, UserStatus status) {
        Specification<User> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (hasText(keyword)) {
            String pattern = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), pattern)
            ));
        }

        if (role != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("role"), role));
        }

        if (status != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }

        return specification;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
