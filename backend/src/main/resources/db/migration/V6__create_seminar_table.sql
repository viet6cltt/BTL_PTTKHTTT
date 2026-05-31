CREATE TABLE seminar (
    seminar_id BIGSERIAL PRIMARY KEY,
    seminar_type_id BIGINT NOT NULL,
    consultant_id BIGINT NOT NULL,
    booking_department_user_id BIGINT NOT NULL,
    coordinator_user_id BIGINT,
    seminar_name VARCHAR(255) NOT NULL,
    expected_time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_LOGISTICS',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    city VARCHAR(100) NOT NULL,
    anticipated_registrants INTEGER NOT NULL,
    booking_created_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    CONSTRAINT fk_seminar_seminar_type FOREIGN KEY (seminar_type_id)
        REFERENCES seminar_type (seminar_type_id),
    CONSTRAINT fk_seminar_consultant FOREIGN KEY (consultant_id)
        REFERENCES consultants (consultant_id),
    CONSTRAINT fk_seminar_booking_department_user FOREIGN KEY (booking_department_user_id)
        REFERENCES users (user_id),
    CONSTRAINT fk_seminar_coordinator_user FOREIGN KEY (coordinator_user_id)
        REFERENCES users (user_id),
    CONSTRAINT chk_seminar_expected_time_slot CHECK (
        expected_time_slot IN ('FULL_DAY', 'MORNING', 'AFTERNOON')
    ),
    CONSTRAINT chk_seminar_status CHECK (
        status IN (
            'PENDING_LOGISTICS',
            'FACILITY_SECURED',
            'TRAVEL_CONFIRMED',
            'READY_FOR_SEMINAR',
            'CANCELLED'
        )
    ),
    CONSTRAINT chk_seminar_anticipated_registrants_positive CHECK (anticipated_registrants > 0),
    CONSTRAINT chk_seminar_date_order CHECK (end_date >= start_date)
);

CREATE INDEX idx_seminar_seminar_type_id
    ON seminar (seminar_type_id);

CREATE INDEX idx_seminar_consultant_id
    ON seminar (consultant_id);

CREATE INDEX idx_seminar_booking_department_user_id
    ON seminar (booking_department_user_id);

CREATE INDEX idx_seminar_coordinator_user_id
    ON seminar (coordinator_user_id);

CREATE INDEX idx_seminar_status
    ON seminar (status);

CREATE INDEX idx_seminar_city
    ON seminar (city);

CREATE INDEX idx_seminar_start_date
    ON seminar (start_date);
