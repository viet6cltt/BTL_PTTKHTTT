CREATE TABLE facilities (
    facility_id BIGSERIAL PRIMARY KEY,
    facility_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    max_capacity INTEGER NOT NULL,
    sales_manager_name VARCHAR(100),
    sales_manager_phone VARCHAR(20),
    sales_manager_email VARCHAR(150),
    number_of_room INTEGER,
    cost_for_each_day NUMERIC(15, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seminar_facility_contracts (
    contract_id BIGSERIAL PRIMARY KEY,
    seminar_id BIGINT NOT NULL UNIQUE,
    facility_id BIGINT NOT NULL,
    total_cost NUMERIC(15, 2),
    contract_created_time TIMESTAMP,
    contract_doc_path VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_NEGOTIATE',
    notes TEXT,
    CONSTRAINT fk_contracts_facility FOREIGN KEY (facility_id) REFERENCES facilities (facility_id),
    CONSTRAINT chk_contracts_status CHECK (status IN ('PENDING_NEGOTIATE', 'APPROVED', 'REJECTED'))
);

CREATE TABLE av_equipment_reservations (
    contract_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    quantity_reserved INTEGER NOT NULL,
    cost_for_each_equipment NUMERIC(15, 2),
    PRIMARY KEY (contract_id, equipment_id),
    CONSTRAINT fk_av_reservations_contract FOREIGN KEY (contract_id) REFERENCES seminar_facility_contracts (contract_id) ON DELETE CASCADE
);
