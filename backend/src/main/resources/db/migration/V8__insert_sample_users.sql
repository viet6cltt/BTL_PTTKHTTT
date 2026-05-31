-- Insert default users with password "password" (BCrypt hash)
INSERT INTO users (full_name, email, password_hash, phone, role, status) VALUES
('Nguyễn Minh Booking', 'booking1@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0123456789', 'BOOKING_STAFF', 'ACTIVE'),
('Phạm Lan Booking', 'booking2@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0123456788', 'BOOKING_STAFF', 'ACTIVE'),
('Lê Minh Tuấn', 'leminhtuan@gmail.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0987654321', 'CONSULTANT', 'ACTIVE'),
('Trần Thu Hà', 'tranthuha@gmail.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0912345678', 'CONSULTANT', 'ACTIVE'),
('Phạm Quốc Huy', 'phamquochuy@gmail.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0903222111', 'CONSULTANT', 'ACTIVE'),
('Hoàng Anh Đức', 'coordinator@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0234567890', 'LOGISTICS_COORDINATOR', 'ACTIVE'),
('Phạm Hải Yến', 'materials@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0345678901', 'MATERIALS_STAFF', 'ACTIVE'),
('Quản trị viên', 'admin@training.com', '$2a$10$8.22I5SMfE.q5.hPeeXwPeW.yI6J3196K7eI1.0vX6Q4lH.K.O4Wq', '0999999999', 'ADMIN', 'ACTIVE');

-- Insert consultants matching the user profiles
INSERT INTO consultants (user_id, specialty, travel_preference, address, city, country) VALUES
((SELECT user_id FROM users WHERE email = 'leminhtuan@gmail.com'), 'Quản lý dự án và vận hành', 'Window seat, vegetarian meals', '12 Nguyễn Trãi', 'Hà Nội', 'Việt Nam'),
((SELECT user_id FROM users WHERE email = 'tranthuha@gmail.com'), 'Lãnh đạo và truyền thông nội bộ', 'Aisle seat', '25 Bạch Đằng', 'Đà Nẵng', 'Việt Nam'),
((SELECT user_id FROM users WHERE email = 'phamquochuy@gmail.com'), 'Kỹ thuật phần mềm và đào tạo thực hành', 'No preference', '88 Võ Văn Tần', 'TP. Hồ Chí Minh', 'Việt Nam');
