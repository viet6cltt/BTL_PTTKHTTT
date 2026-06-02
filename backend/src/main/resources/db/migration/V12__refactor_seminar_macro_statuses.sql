ALTER TABLE seminar
    DROP CONSTRAINT chk_seminar_status;

UPDATE seminar
SET status = 'IN_PROGRESS'
WHERE status IN ('TRAVEL_CONFIRMED', 'OVERDUE');

ALTER TABLE seminar
    ADD CONSTRAINT chk_seminar_status CHECK (
        status IN (
            'PENDING_LOGISTICS',
            'FACILITY_SECURED',
            'IN_PROGRESS',
            'READY_FOR_SEMINAR',
            'CANCELLED'
        )
    );
