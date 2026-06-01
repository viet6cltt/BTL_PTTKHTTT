package com.training.logistics.seminar.model;

public enum SeminarStatus {
    PENDING_LOGISTICS,
    FACILITY_SECURED, // Đã có địa điểm tổ chức, sau khi contract thành công
    TRAVEL_CONFIRMED,
    READY_FOR_SEMINAR,
    CANCELLED,
    OVERDUE
}
