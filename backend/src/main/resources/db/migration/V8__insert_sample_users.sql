-- Insert default users with password "password" (BCrypt hash)
INSERT INTO users (user_id, full_name, email, password_hash, phone, role, status) VALUES
(1, 'Nguyễn Minh Booking', 'booking1@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0123456789', 'BOOKING_STAFF', 'ACTIVE'),
(2, 'Phạm Lan Booking', 'booking2@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0123456788', 'BOOKING_STAFF', 'ACTIVE'),
(3, 'Lê Minh Tuấn', 'leminhtuan@gmail.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0987654321', 'CONSULTANT', 'ACTIVE'),
(4, 'Trần Thu Hà', 'tranthuha@gmail.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0912345678', 'CONSULTANT', 'ACTIVE'),
(5, 'Phạm Quốc Huy', 'phamquochuy@gmail.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0903222111', 'CONSULTANT', 'ACTIVE'),
(6, 'Hoàng Anh Đức', 'coordinator@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0234567890', 'LOGISTICS_COORDINATOR', 'ACTIVE'),
(7, 'Phạm Hải Yến', 'materials@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0345678901', 'MATERIALS_STAFF', 'ACTIVE'),
(8, 'Quản trị viên', 'admin@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0999999999', 'ADMIN', 'ACTIVE');

-- Insert consultants matching the user profiles
INSERT INTO consultants (consultant_id, user_id, specialty, travel_preference, address, city, country) VALUES
(1, 3, 'Quản lý dự án và vận hành', 'Window seat, vegetarian meals', '12 Nguyễn Trãi', 'Hà Nội', 'Việt Nam'),
(2, 4, 'Lãnh đạo và truyền thông nội bộ', 'Aisle seat', '25 Bạch Đằng', 'Đà Nẵng', 'Việt Nam'),
(3, 5, 'Kỹ thuật phần mềm và đào tạo thực hành', 'No preference', '88 Võ Văn Tần', 'TP. Hồ Chí Minh', 'Việt Nam');

-- Reset sequences for serial columns in PostgreSQL
SELECT pg_catalog.setval('users_user_id_seq', 8, true);
SELECT pg_catalog.setval('consultants_consultant_id_seq', 3, true);
