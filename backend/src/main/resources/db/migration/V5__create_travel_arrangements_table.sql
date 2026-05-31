CREATE TABLE travel_arrangements (
    travel_arrangement_id BIGSERIAL PRIMARY KEY,
    seminar_id BIGINT NOT NULL,
    consultant_id BIGINT NOT NULL,
    travel_agency_name VARCHAR(255),
    transport_mode VARCHAR(50) NOT NULL,
    carrier_name VARCHAR(255),
    service_number VARCHAR(100),
    departure_location VARCHAR(255) NOT NULL,
    arrival_location VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    seat_info VARCHAR(255),
    cost NUMERIC(15, 2),
    confirmation_sent_datetime TIMESTAMP NULL,
    travel_arrangement_status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    CONSTRAINT chk_travel_arrangements_transport_mode CHECK (
        transport_mode IN ('FLIGHT', 'TRAIN', 'BUS', 'CAR', 'OTHER')
    ),
    CONSTRAINT chk_travel_arrangements_status CHECK (
        travel_arrangement_status IN ('BOOKED', 'CONFIRMED', 'CANCELLED')
    )
);

CREATE INDEX idx_travel_arrangements_seminar_id
    ON travel_arrangements (seminar_id);

CREATE INDEX idx_travel_arrangements_consultant_id
    ON travel_arrangements (consultant_id);

CREATE INDEX idx_travel_arrangements_status
    ON travel_arrangements (travel_arrangement_status);

CREATE INDEX idx_travel_arrangements_seminar_consultant
    ON travel_arrangements (seminar_id, consultant_id);
