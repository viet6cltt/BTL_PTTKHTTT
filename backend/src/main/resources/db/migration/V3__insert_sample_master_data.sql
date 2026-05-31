DELETE FROM av_equipment_requirement;
DELETE FROM material_requirement;
DELETE FROM audio_visual_equipment;
DELETE FROM material;
DELETE FROM seminar_type;

-- Reset identity sequences
ALTER TABLE seminar_type ALTER COLUMN seminar_type_id RESTART WITH 1;
ALTER TABLE material ALTER COLUMN material_id RESTART WITH 1;
ALTER TABLE audio_visual_equipment ALTER COLUMN equipment_id RESTART WITH 1;

-- =========================
-- 1. SEMINAR TYPE
-- =========================

INSERT INTO seminar_type
(seminar_type_id, type_name, description, duration, arrangement_notes)
VALUES
(1, 'Quản lý dự án cơ bản',
 'Khóa đào tạo giới thiệu về lập kế hoạch dự án, quản lý tiến độ, rủi ro và giao tiếp với các bên liên quan.',
 16,
 'Bố trí lớp học truyền thống. Cần máy chiếu, màn chiếu, bàn giảng viên và không gian thảo luận nhóm.'),

(2, 'Kỹ năng lãnh đạo cho quản lý cấp trung',
 'Hội thảo thực hành dành cho quản lý cấp trung về lãnh đạo nhóm, giao tiếp, ra quyết định và xử lý xung đột.',
 12,
 'Ưu tiên bố trí bàn tròn hoặc nhóm nhỏ. Cần không gian cho hoạt động thảo luận và bài tập tình huống.'),

(3, 'Đào tạo kỹ thuật phần mềm thực hành',
 'Khóa đào tạo thực hành về quy trình phát triển phần mềm, công cụ lập trình, kiểm thử và triển khai ứng dụng.',
 24,
 'Cần phòng có ổ điện đầy đủ, Internet ổn định, máy chiếu và bàn cho học viên sử dụng laptop.'),

(4, 'Kỹ năng bán hàng và đàm phán',
 'Khóa đào tạo về quy trình bán hàng, chăm sóc khách hàng, xử lý phản đối và kỹ năng đàm phán thương mại.',
 8,
 'Bố trí lớp học hoặc rạp hát. Cần micro không dây, máy chiếu và khu vực thực hành đóng vai.'),

(5, 'An toàn lao động và tuân thủ nội bộ',
 'Khóa đào tạo về quy định an toàn lao động, chính sách nội bộ, quy trình báo cáo sự cố và tuân thủ doanh nghiệp.',
 6,
 'Bố trí lớp học đơn giản. Cần máy chiếu, màn chiếu và hệ thống âm thanh cơ bản.');

-- =========================
-- 2. MATERIAL
-- =========================

INSERT INTO material
(material_id, material_name, material_type, description, unit)
VALUES
(1, 'Tài liệu học viên',
 'Tài liệu in',
 'Tập tài liệu chính dùng cho học viên trong suốt khóa đào tạo.',
 'quyển'),

(2, 'Sổ tay giảng viên',
 'Tài liệu in',
 'Tài liệu hướng dẫn chi tiết dành cho chuyên gia đào tạo.',
 'quyển'),

(3, 'Phiếu bài tập tình huống',
 'Tài liệu in',
 'Bộ bài tập tình huống dùng cho hoạt động nhóm và thảo luận.',
 'bộ'),

(4, 'Thẻ tên học viên',
 'Văn phòng phẩm',
 'Thẻ tên dùng để nhận diện học viên trong buổi đào tạo.',
 'cái'),

(5, 'Phiếu đánh giá khóa học',
 'Biểu mẫu',
 'Phiếu khảo sát phản hồi của học viên sau khi kết thúc khóa đào tạo.',
 'tờ'),

(6, 'Chứng nhận hoàn thành',
 'Tài liệu in',
 'Giấy chứng nhận cấp cho học viên hoàn thành khóa đào tạo.',
 'tờ'),

(7, 'Tờ rơi giới thiệu công ty',
 'Tài liệu marketing',
 'Tờ rơi giới thiệu dịch vụ và các chương trình đào tạo của công ty.',
 'tờ'),

(8, 'Giấy flipchart',
 'Văn phòng phẩm',
 'Giấy dùng cho bảng flipchart trong các hoạt động thảo luận nhóm.',
 'tập'),

(9, 'Bút lông viết bảng',
 'Văn phòng phẩm',
 'Bộ bút lông nhiều màu dùng cho bảng trắng hoặc flipchart.',
 'bộ'),

(10, 'USB tài liệu thực hành',
 'Tài liệu số',
 'USB chứa slide, file mẫu, template và tài liệu thực hành.',
 'cái');

-- =========================
-- 3. AUDIO VISUAL EQUIPMENT
-- =========================

INSERT INTO audio_visual_equipment
(equipment_id, equipment_name, equipment_type, unit)
VALUES
(1, 'Máy chiếu LCD',
 'Trình chiếu',
 'cái'),

(2, 'Màn chiếu',
 'Trình chiếu',
 'cái'),

(3, 'Micro không dây',
 'Âm thanh',
 'cái'),

(4, 'Hệ thống loa phòng họp',
 'Âm thanh',
 'bộ'),

(5, 'Laptop cho giảng viên',
 'Máy tính',
 'cái'),

(6, 'Bộ chuyển đổi HDMI/USB-C',
 'Phụ kiện trình chiếu',
 'bộ'),

(7, 'Bút trình chiếu laser',
 'Phụ kiện trình bày',
 'cái'),

(8, 'Bảng trắng',
 'Thiết bị ghi chú',
 'cái'),

(9, 'Bảng flipchart',
 'Thiết bị ghi chú',
 'cái'),

(10, 'Bộ ổ cắm điện mở rộng',
 'Phụ kiện điện',
 'bộ');

-- =========================
-- 4. MATERIAL REQUIREMENT
-- =========================

INSERT INTO material_requirement
(seminar_type_id, material_id, default_quantity, is_depend_on_num_participant, participant_per_quantity, notes)
VALUES
-- Seminar type 1: Quản lý dự án cơ bản
(1, 1, 1, TRUE, 1, 'Mỗi học viên nhận một quyển tài liệu học viên.'),
(1, 2, 1, FALSE, NULL, 'Một sổ tay dành cho giảng viên.'),
(1, 3, 1, TRUE, 5, 'Mỗi nhóm khoảng 5 học viên dùng một bộ bài tập tình huống.'),
(1, 4, 1, TRUE, 1, 'Mỗi học viên cần một thẻ tên.'),
(1, 5, 1, TRUE, 1, 'Mỗi học viên điền một phiếu đánh giá sau khóa học.'),

-- Seminar type 2: Kỹ năng lãnh đạo cho quản lý cấp trung
(2, 1, 1, TRUE, 1, 'Mỗi học viên nhận một bộ tài liệu chính.'),
(2, 2, 1, FALSE, NULL, 'Một sổ tay dành cho giảng viên.'),
(2, 3, 1, TRUE, 4, 'Mỗi nhóm 4 học viên dùng một bộ bài tập tình huống.'),
(2, 8, 2, FALSE, NULL, 'Chuẩn bị hai tập giấy flipchart cho hoạt động nhóm.'),
(2, 9, 2, FALSE, NULL, 'Chuẩn bị hai bộ bút lông cho các nhóm.'),

-- Seminar type 3: Đào tạo kỹ thuật phần mềm thực hành
(3, 1, 1, TRUE, 1, 'Mỗi học viên nhận một tài liệu hướng dẫn thực hành.'),
(3, 2, 1, FALSE, NULL, 'Một sổ tay dành cho giảng viên kỹ thuật.'),
(3, 10, 1, TRUE, 1, 'Mỗi học viên nhận một USB chứa tài liệu thực hành.'),
(3, 5, 1, TRUE, 1, 'Mỗi học viên điền một phiếu đánh giá.'),
(3, 4, 1, TRUE, 1, 'Mỗi học viên cần một thẻ tên.'),

-- Seminar type 4: Kỹ năng bán hàng và đàm phán
(4, 1, 1, TRUE, 1, 'Mỗi học viên nhận một tài liệu đào tạo bán hàng.'),
(4, 3, 1, TRUE, 5, 'Mỗi nhóm 5 học viên dùng một bộ tình huống đàm phán.'),
(4, 4, 1, TRUE, 1, 'Mỗi học viên cần một thẻ tên.'),
(4, 5, 1, TRUE, 1, 'Mỗi học viên điền một phiếu đánh giá.'),
(4, 7, 1, TRUE, 5, 'Cứ 5 học viên chuẩn bị một tờ rơi giới thiệu công ty.'),

-- Seminar type 5: An toàn lao động và tuân thủ nội bộ
(5, 1, 1, TRUE, 1, 'Mỗi học viên nhận một tài liệu hướng dẫn an toàn và tuân thủ.'),
(5, 5, 1, TRUE, 1, 'Mỗi học viên điền một phiếu đánh giá.'),
(5, 6, 1, TRUE, 1, 'Mỗi học viên nhận một chứng nhận hoàn thành.'),
(5, 4, 1, TRUE, 1, 'Mỗi học viên cần một thẻ tên.');

-- =========================
-- 5. AV EQUIPMENT REQUIREMENT
-- =========================

INSERT INTO av_equipment_requirement
(equipment_id, seminar_type_id, quantity_required, is_depend_on_num_participant, participant_per_quantity)
VALUES
-- Seminar type 1: Quản lý dự án cơ bản
(1, 1, 1, FALSE, NULL),
(2, 1, 1, FALSE, NULL),
(3, 1, 1, FALSE, NULL),
(7, 1, 1, FALSE, NULL),
(8, 1, 1, FALSE, NULL),

-- Seminar type 2: Kỹ năng lãnh đạo cho quản lý cấp trung
(1, 2, 1, FALSE, NULL),
(2, 2, 1, FALSE, NULL),
(3, 2, 1, FALSE, NULL),
(8, 2, 1, FALSE, NULL),
(9, 2, 2, FALSE, NULL),

-- Seminar type 3: Đào tạo kỹ thuật phần mềm thực hành
(1, 3, 1, FALSE, NULL),
(2, 3, 1, FALSE, NULL),
(5, 3, 1, FALSE, NULL),
(6, 3, 1, FALSE, NULL),
(10, 3, 1, TRUE, 10),

-- Seminar type 4: Kỹ năng bán hàng và đàm phán
(1, 4, 1, FALSE, NULL),
(2, 4, 1, FALSE, NULL),
(3, 4, 1, TRUE, 50),
(4, 4, 1, FALSE, NULL),
(7, 4, 1, FALSE, NULL),

-- Seminar type 5: An toàn lao động và tuân thủ nội bộ
(1, 5, 1, FALSE, NULL),
(2, 5, 1, FALSE, NULL),
(3, 5, 1, FALSE, NULL),
(4, 5, 1, FALSE, NULL);

-- =========================================================
-- End of sample data
-- =========================================================

ALTER TABLE seminar_type ALTER COLUMN seminar_type_id RESTART WITH 6;
ALTER TABLE material ALTER COLUMN material_id RESTART WITH 11;
ALTER TABLE audio_visual_equipment ALTER COLUMN equipment_id RESTART WITH 11;
