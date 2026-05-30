CREATE TABLE facilities (
    facility_id BIGSERIAL PRIMARY KEY,
    facility_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    sales_manager_name VARCHAR(100),
    sales_manager_phone VARCHAR(20),
    sales_manager_email VARCHAR(150),
    number_of_room INTEGER,
    cost_for_each_day NUMERIC(15, 2)
);

CREATE TABLE seminar_facility_contracts (
    contract_id BIGSERIAL PRIMARY KEY,
    seminar_id BIGINT NOT NULL UNIQUE,
    facility_id BIGINT NOT NULL,
    reservation_date DATE,
    contract_created_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'NOTSIGNED',
    total_cost NUMERIC(15, 2),
    CONSTRAINT fk_contracts_facility FOREIGN KEY (facility_id) REFERENCES facilities (facility_id),
    CONSTRAINT chk_contracts_status CHECK (status IN ('NOTSIGNED', 'SIGNED'))
);

CREATE TABLE contract_documents (
    document_id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(120),
    file_url VARCHAR(500) NOT NULL,
    object_name VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500),
    CONSTRAINT fk_documents_contract FOREIGN KEY (contract_id) REFERENCES seminar_facility_contracts (contract_id) ON DELETE CASCADE
);

CREATE TABLE facility_room_reservations (
    room_id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    num_seats INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    room_width NUMERIC(10, 2),
    room_length NUMERIC(10, 2),
    seat_arrangement_notes VARCHAR(500),
    room_cost NUMERIC(15, 2),
    CONSTRAINT fk_rooms_contract FOREIGN KEY (contract_id) REFERENCES seminar_facility_contracts (contract_id) ON DELETE CASCADE
);

CREATE TABLE audio_visual_equipments (
    equipment_id BIGSERIAL PRIMARY KEY,
    equipment_name VARCHAR(150) NOT NULL,
    equipment_type VARCHAR(100),
    unit VARCHAR(50)
);

CREATE TABLE av_equipment_requirements (
    seminar_type_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    quantity_required INTEGER NOT NULL,
    is_depend_on_num_participant BOOLEAN,
    participant_per_quantity INTEGER,
    PRIMARY KEY (seminar_type_id, equipment_id),
    CONSTRAINT fk_av_requirements_equipment FOREIGN KEY (equipment_id) REFERENCES audio_visual_equipments (equipment_id)
);

CREATE TABLE av_equipment_reservations (
    contract_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    quantity_reserved INTEGER NOT NULL,
    cost_for_each_equipment NUMERIC(15, 2),
    PRIMARY KEY (contract_id, equipment_id),
    CONSTRAINT fk_av_reservations_contract FOREIGN KEY (contract_id) REFERENCES seminar_facility_contracts (contract_id) ON DELETE CASCADE,
    CONSTRAINT fk_av_reservations_equipment FOREIGN KEY (equipment_id) REFERENCES audio_visual_equipments (equipment_id)
);
