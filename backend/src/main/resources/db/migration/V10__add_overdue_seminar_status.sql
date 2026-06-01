ALTER TABLE seminar
    DROP CONSTRAINT chk_seminar_status;

ALTER TABLE seminar
    ADD CONSTRAINT chk_seminar_status CHECK (
        status IN (
            'PENDING_LOGISTICS',
            'FACILITY_SECURED',
            'TRAVEL_CONFIRMED',
            'READY_FOR_SEMINAR',
            'CANCELLED',
            'OVERDUE'
        )
    );

UPDATE seminar
SET status = 'OVERDUE'
WHERE start_date < CURRENT_DATE
  AND status NOT IN ('READY_FOR_SEMINAR', 'CANCELLED', 'OVERDUE');
