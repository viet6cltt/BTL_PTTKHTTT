CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (
        role IN (
            'BOOKING_STAFF',
            'LOGISTICS_COORDINATOR',
            'CONSULTANT',
            'MATERIALS_STAFF',
            'ADMIN'
        )
    ),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'DISABLED'))
);

CREATE TABLE consultants (
    consultant_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialty VARCHAR(255),
    travel_preference TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    CONSTRAINT fk_consultants_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);
