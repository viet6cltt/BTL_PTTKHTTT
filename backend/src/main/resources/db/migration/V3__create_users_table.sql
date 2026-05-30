CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);
