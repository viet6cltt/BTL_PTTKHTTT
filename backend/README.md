# Training Logistics Backend

Backend cho hệ thống Training Logistics Management, xây dựng bằng Spring Boot theo hướng modular monolith. Ứng dụng cung cấp REST API cho xác thực, quản lý seminar, master data, hợp đồng cơ sở vật chất, lịch di chuyển consultant và yêu cầu học liệu.

## Công nghệ

- Java 21
- Spring Boot 3.5
- Spring Web, Spring Security, Spring Data JPA, Bean Validation
- PostgreSQL
- Flyway
- MinIO
- JWT
- Lombok
- springdoc-openapi
- Maven

## Module nghiệp vụ

```text
src/main/java/com/training/logistics
├── auth/                  # Đăng nhập, người dùng, phân quyền, JWT
├── masterdata/            # Seminar type, học liệu, thiết bị AV, định mức
├── seminar/               # Lập lịch seminar, gán coordinator, trạng thái chuẩn bị
├── facility_contract/     # Cơ sở vật chất, hợp đồng, đặt phòng, đặt thiết bị AV
├── travel/                # Consultant, lịch di chuyển, itinerary
├── materialrequest/       # Yêu cầu học liệu và trạng thái giao nhận
├── dashboard/             # Dữ liệu tổng hợp cho dashboard
├── common/                # Exception, DTO, config, tiện ích dùng chung
└── config/                # Cấu hình ứng dụng
```

## Yêu cầu

- Java 21
- Maven 3+
- PostgreSQL 16 hoặc Docker
- MinIO hoặc Docker

## Cấu hình

Ứng dụng đọc cấu hình từ biến môi trường hoặc file `.env` trong thư mục `backend/`.

Ví dụ `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logistics_db
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=secret_password

MINIO_HOST=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=minio_secret_password
MINIO_BUCKET_NAME=logistics-bucket

SECRET_KEY=chuoi_bi_mat_sieu_cap_vip_pro_1023
PORT=8080
```

Các cấu hình chính nằm ở `src/main/resources/application.yml`.

## Chạy bằng Docker Compose

Từ thư mục gốc của repository:

```bash
docker compose up --build training-logistics-db training-logistics-minio backend
```

Backend sẽ chạy tại:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

## Chạy local khi phát triển

### 1. Chạy PostgreSQL và MinIO

Từ thư mục gốc repository:

```bash
docker compose up training-logistics-db training-logistics-minio
```

### 2. Chạy backend

Từ thư mục `backend/`:

```bash
mvn spring-boot:run
```

Khi khởi động, Flyway tự chạy các migration trong:

```text
src/main/resources/db/migration
```

## Build và test

Chạy test:

```bash
mvn test
```

Build file jar:

```bash
mvn clean package
```

Chạy jar sau khi build:

```bash
java -jar target/logistics-0.0.1-SNAPSHOT.jar
```

## API chính

| Nhóm | Endpoint |
| --- | --- |
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Consultants | `/api/v1/consultants` |
| Consultant itinerary | `/api/v1/consultant/travel-itinerary` |
| Seminars | `/api/v1/seminars` |
| Facilities | `/api/v1/facilities` |
| Facility contracts | `/api/v1/facility-contracts` |
| Reservations | `/api/v1/reservations` |
| Travel arrangements | `/api/v1/travel-arrangements` |
| Material requests | `/api/v1/material-requests` |
| Seminar type master data | `/api/v1/master-data/seminar-types` |
| Material master data | `/api/master-data/materials` |
| AV equipment master data | `/api/master-data/audio-visual-equipments` |
| Material requirements | `/api/master-data/seminar-types/{seminarTypeId}/material-requirements` |
| AV equipment requirements | `/api/master-data/seminar-types/{seminarTypeId}/av-equipment-requirements` |

Chi tiết request/response có thể xem trong Swagger UI khi backend đang chạy.

## Tài khoản seed mẫu

Migration tạo sẵn các tài khoản sau. Mật khẩu mặc định:

```text
password
```

| Vai trò | Email |
| --- | --- |
| ADMIN | `admin@training.com` |
| BOOKING_STAFF | `booking1@training.com` |
| BOOKING_STAFF | `booking2@training.com` |
| LOGISTICS_COORDINATOR | `coordinator@training.com` |
| MATERIALS_STAFF | `materials@training.com` |
| CONSULTANT | `leminhtuan@gmail.com` |
| CONSULTANT | `tranthuha@gmail.com` |
| CONSULTANT | `phamquochuy@gmail.com` |

## Đăng nhập thử bằng curl

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@training.com","password":"password"}'
```

Các API yêu cầu xác thực cần header:

```text
Authorization: Bearer <token>
```

## Ghi chú phát triển

- Schema database được quản lý bằng Flyway, không sửa trực tiếp schema thủ công nếu thay đổi cần lưu vào source.
- `spring.jpa.hibernate.ddl-auto=validate`, vì vậy entity phải khớp với migration.
- File upload hợp đồng/avatar dùng MinIO.
- Các service nghiệp vụ phức tạp dùng transaction để đảm bảo cập nhật dữ liệu nhất quán.
