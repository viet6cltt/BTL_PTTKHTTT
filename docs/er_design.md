1. Mô tả các quan hệ và thuộc tính

## USERS

Lưu tài khoản người dùng hệ thống.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| user_id | Mã người dùng | PK |
| full_name | Họ tên người dùng | NOT NULL |
| email | Email đăng nhập/liên hệ | NOT NULL, UNIQUE |
| password_hash | Mật khẩu đã hash | NOT NULL |
| phone | Số điện thoại | NOT NULL, UNIQUE |
| role | Vai trò người dùng | NOT NULL, BOOKING_STAFF/LOGISTICS_COORDINATOR/CONSULTANT/MATERIALS_STAFF/ADMIN |
| status | Trạng thái tài khoản | NOT NULL, ACTIVE/DISABLED, default ACTIVE |
| created_at | Thời điểm tạo tài khoản | NOT NULL, default CURRENT_TIMESTAMP |

## CONSULTANTS

Lưu hồ sơ chuyên gia đào tạo. Mỗi consultant gắn với đúng một user có vai trò
`CONSULTANT`.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| consultant_id | Mã consultant | PK |
| user_id | Tài khoản người dùng của consultant | FK tới USERS, NOT NULL, UNIQUE |
| specialty | Chuyên môn/lĩnh vực đào tạo |  |
| travel_preference | Ghi chú về ưu tiên di chuyển |  |
| address | Địa chỉ consultant |  |
| city | Thành phố của consultant |  |
| country | Quốc gia của consultant |  |

## SEMINAR_TYPE

Lưu danh mục loại seminar mà công ty tổ chức.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| seminar_type_id | Mã loại seminar | PK |
| type_name | Tên loại seminar | NOT NULL |
| description | Mô tả loại seminar |  |
| duration | Thời lượng seminar dự kiến theo giờ | NOT NULL, > 0 |
| arrangement_notes | Ghi chú về cách bố trí phòng/chỗ ngồi/tổ chức |  |

## SEMINAR

Lưu một seminar cụ thể do booking staff tạo và logistics coordinator phụ trách
về sau.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| seminar_id | Mã seminar | PK |
| seminar_type_id | Loại seminar | FK tới SEMINAR_TYPE, NOT NULL |
| consultant_id | Consultant phụ trách nội dung | FK tới CONSULTANTS, NOT NULL |
| booking_department_user_id | Booking staff tạo seminar | FK tới USERS, NOT NULL |
| coordinator_user_id | Logistics coordinator được gán/claim seminar | FK tới USERS, NULL |
| seminar_name | Tên seminar | NOT NULL |
| expected_time_slot | Khung thời gian dự kiến | NOT NULL, FULL_DAY/MORNING/AFTERNOON |
| status | Trạng thái seminar | NOT NULL, PENDING_LOGISTICS/FACILITY_SECURED/TRAVEL_CONFIRMED/READY_FOR_SEMINAR/CANCELLED |
| start_date | Ngày bắt đầu | NOT NULL |
| end_date | Ngày kết thúc | NOT NULL, >= start_date |
| city | Thành phố tổ chức | NOT NULL |
| anticipated_registrants | Số người tham dự dự kiến | NOT NULL, > 0 |
| booking_created_date_time | Thời điểm booking staff tạo seminar | NOT NULL, default CURRENT_TIMESTAMP |
| note | Ghi chú thêm |  |

## FACILITIES

Lưu thông tin địa điểm/cơ sở tổ chức seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| facility_id | Mã facility | PK |
| facility_name | Tên địa điểm/cơ sở | NOT NULL |
| address | Địa chỉ facility | NOT NULL |
| city | Thành phố của facility | NOT NULL |
| max_capacity | Sức chứa tối đa | NOT NULL |
| sales_manager_name | Tên sales manager phụ trách |  |
| sales_manager_phone | Số điện thoại sales manager |  |
| sales_manager_email | Email sales manager |  |
| number_of_room | Số phòng họp |  |
| cost_for_each_day | Giá tham khảo theo ngày |  |
| created_at | Thời điểm tạo facility | NOT NULL, default CURRENT_TIMESTAMP |

## SEMINAR_FACILITY_CONTRACTS

Lưu hợp đồng/thỏa thuận đặt facility cho seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| contract_id | Mã hợp đồng | PK |
| seminar_id | Seminar được đặt facility | NOT NULL, UNIQUE, tham chiếu logic tới SEMINAR |
| facility_id | Facility được chọn | FK tới FACILITIES, NOT NULL |
| total_cost | Tổng chi phí đã thỏa thuận |  |
| contract_created_time | Thời điểm tạo/ký hợp đồng |  |
| contract_doc_path | Đường dẫn file hợp đồng |  |
| status | Trạng thái hợp đồng | NOT NULL, PENDING_NEGOTIATE/APPROVED/REJECTED, default PENDING_NEGOTIATE |
| notes | Ghi chú hợp đồng |  |

## FACILITY_ROOM_RESERVATIONS

Lưu danh sách phòng được đặt trong hợp đồng facility.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| room_reservation_id | Mã dòng đặt phòng | PK |
| contract_id | Hợp đồng facility | FK tới SEMINAR_FACILITY_CONTRACTS, NOT NULL, ON DELETE CASCADE |
| room_name_spec | Tên/mã phòng hoặc mô tả phòng | NOT NULL |
| seating_arrangement | Cách sắp xếp chỗ ngồi |  |
| num_seats | Số ghế/chỗ ngồi | NOT NULL, >= 0 |
| room_image_url | URL ảnh phòng |  |

## AUDIO_VISUAL_EQUIPMENT

Lưu danh mục thiết bị nghe nhìn.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| equipment_id | Mã thiết bị | PK |
| equipment_name | Tên thiết bị | NOT NULL |
| equipment_type | Loại thiết bị | NOT NULL |
| unit | Đơn vị tính | NOT NULL |

## AV_EQUIPMENT_REQUIREMENT

Lưu thiết bị AV mặc định cần cho từng loại seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| equipment_id | Thiết bị AV | PK, FK tới AUDIO_VISUAL_EQUIPMENT |
| seminar_type_id | Loại seminar | PK, FK tới SEMINAR_TYPE |
| quantity_required | Số lượng thiết bị cần | NOT NULL, > 0 |
| is_depend_on_num_participant | Có phụ thuộc số người tham dự hay không | NOT NULL |
| participant_per_quantity | Số người tương ứng mỗi đơn vị thiết bị | > 0 nếu is_depend_on_num_participant = true; NULL nếu false |

## AV_EQUIPMENT_RESERVATIONS

Lưu thiết bị AV thực tế được đặt/thuê trong hợp đồng với facility.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| contract_id | Hợp đồng facility | PK, FK tới SEMINAR_FACILITY_CONTRACTS, ON DELETE CASCADE |
| equipment_id | Thiết bị AV được đặt | PK, tham chiếu logic tới AUDIO_VISUAL_EQUIPMENT |
| quantity_reserved | Số lượng thiết bị đã đặt | NOT NULL |
| cost_for_each_equipment | Giá thuê mỗi thiết bị |  |

## MATERIAL

Lưu danh mục vật tư/tài liệu dùng cho seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| material_id | Mã vật tư | PK |
| material_name | Tên vật tư/tài liệu | NOT NULL |
| material_type | Loại vật tư | NOT NULL |
| description | Mô tả vật tư |  |
| unit | Đơn vị tính | NOT NULL |

## MATERIAL_REQUIREMENT

Lưu danh sách vật tư mặc định cần cho từng loại seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| seminar_type_id | Loại seminar | PK, FK tới SEMINAR_TYPE |
| material_id | Vật tư | PK, FK tới MATERIAL |
| default_quantity | Số lượng mặc định | NOT NULL, > 0 |
| is_depend_on_num_participant | Có phụ thuộc số người tham dự hay không | NOT NULL |
| participant_per_quantity | Số người tương ứng mỗi đơn vị vật tư | > 0 nếu is_depend_on_num_participant = true; NULL nếu false |
| notes | Ghi chú yêu cầu vật tư |  |

## MATERIAL_REQUEST

Lưu phần thông tin chung của một yêu cầu gửi vật tư cho seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| material_request_id | Mã yêu cầu vật tư | PK |
| seminar_id | Seminar cần vật tư | FK tới SEMINAR, NOT NULL |
| contract_id | Hợp đồng facility liên quan | NULL, tham chiếu logic tới SEMINAR_FACILITY_CONTRACTS |
| request_date | Ngày tạo yêu cầu | NOT NULL |
| needed_by_date | Ngày cần nhận vật tư | NOT NULL, >= request_date |
| shipment_status | Trạng thái vận chuyển | NOT NULL, REQUESTED/PACKED/SHIPPED/DELIVERED |
| delivered_confirmed_at | Thời điểm coordinator xác nhận đã nhận | NULL nếu chưa xác nhận |
| delivery_confirmation_note | Ghi chú khi xác nhận giao hàng |  |
| notes | Ghi chú thêm về yêu cầu/shipment |  |
| created_at | Thời điểm tạo bản ghi | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | Thời điểm cập nhật gần nhất | NOT NULL, default CURRENT_TIMESTAMP |

## MATERIAL_REQUEST_ITEM

Lưu từng dòng vật tư trong một yêu cầu gửi vật tư.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| material_request_id | Yêu cầu vật tư | PK, FK tới MATERIAL_REQUEST, ON DELETE CASCADE |
| material_id | Vật tư được yêu cầu | PK, FK tới MATERIAL |
| requested_quantity | Số lượng vật tư yêu cầu | NOT NULL, > 0 |
| notes | Ghi chú cho dòng vật tư |  |

## TRAVEL_ARRANGEMENTS

Lưu thông tin sắp xếp di chuyển cho consultant.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| travel_arrangement_id | Mã sắp xếp di chuyển | PK |
| seminar_id | Seminar liên quan | NOT NULL, tham chiếu logic tới SEMINAR |
| consultant_id | Consultant di chuyển | NOT NULL, tham chiếu logic tới CONSULTANTS |
| travel_agency_name | Tên đại lý du lịch hợp tác |  |
| transport_mode | Phương thức di chuyển | NOT NULL, FLIGHT/TRAIN/BUS/CAR/OTHER |
| carrier_name | Tên hãng vận chuyển |  |
| service_number | Số chuyến bay/tàu/mã dịch vụ |  |
| departure_location | Địa điểm khởi hành | NOT NULL |
| arrival_location | Địa điểm đến | NOT NULL |
| departure_time | Thời gian khởi hành | NOT NULL |
| arrival_time | Thời gian đến | NOT NULL |
| seat_info | Thông tin ghế |  |
| cost | Chi phí di chuyển |  |
| confirmation_sent_datetime | Thời điểm gửi xác nhận/lịch trình |  |
| travel_arrangement_status | Trạng thái lịch trình | NOT NULL, BOOKED/CONFIRMED/CANCELLED, default BOOKED |

## Tóm tắt quan hệ

| Quan hệ | Kiểu | Ghi chú |
| :---- | :---- | :---- |
| USERS - CONSULTANTS | 1 - 0..1 | `consultants.user_id` là FK UNIQUE tới `users.user_id` |
| SEMINAR_TYPE - SEMINAR | 1 - N | Mỗi seminar thuộc một seminar type |
| CONSULTANTS - SEMINAR | 1 - N | Mỗi seminar có một consultant |
| USERS - SEMINAR | 1 - N | `booking_department_user_id` là booking staff tạo seminar |
| USERS - SEMINAR | 1 - N | `coordinator_user_id` là logistics coordinator được gán, có thể NULL |
| FACILITIES - SEMINAR_FACILITY_CONTRACTS | 1 - N | Mỗi contract chọn một facility |
| SEMINAR - SEMINAR_FACILITY_CONTRACTS | 1 - 0..1 | `seminar_id` UNIQUE, hiện là tham chiếu logic |
| SEMINAR_FACILITY_CONTRACTS - FACILITY_ROOM_RESERVATIONS | 1 - N | Xóa contract sẽ xóa các room reservation |
| SEMINAR_FACILITY_CONTRACTS - AV_EQUIPMENT_RESERVATIONS | 1 - N | Xóa contract sẽ xóa các AV reservation |
| AUDIO_VISUAL_EQUIPMENT - AV_EQUIPMENT_RESERVATIONS | 1 - N | Hiện là tham chiếu logic qua `equipment_id` |
| SEMINAR_TYPE - MATERIAL_REQUIREMENT | 1 - N | Bảng trung gian với MATERIAL |
| MATERIAL - MATERIAL_REQUIREMENT | 1 - N | Bảng trung gian với SEMINAR_TYPE |
| SEMINAR_TYPE - AV_EQUIPMENT_REQUIREMENT | 1 - N | Bảng trung gian với AUDIO_VISUAL_EQUIPMENT |
| AUDIO_VISUAL_EQUIPMENT - AV_EQUIPMENT_REQUIREMENT | 1 - N | Bảng trung gian với SEMINAR_TYPE |
| SEMINAR - MATERIAL_REQUEST | 1 - N | Mỗi material request thuộc một seminar |
| MATERIAL_REQUEST - MATERIAL_REQUEST_ITEM | 1 - N | Xóa request sẽ xóa các item |
| MATERIAL - MATERIAL_REQUEST_ITEM | 1 - N | Mỗi item chọn một material |
| SEMINAR - TRAVEL_ARRANGEMENTS | 1 - N | Hiện là tham chiếu logic qua `seminar_id` |
| CONSULTANTS - TRAVEL_ARRANGEMENTS | 1 - N | Hiện là tham chiếu logic qua `consultant_id` |
