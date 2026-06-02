# Training Logistics Management System

Hệ thống quản lý hậu cần đào tạo cho Training, Inc. Dự án được tổ chức theo mô hình modular monolith, gồm backend Spring Boot, frontend React/Vite và các dịch vụ hạ tầng PostgreSQL, MinIO.

## Tính năng chính

- Quản lý đăng nhập, người dùng và phân quyền theo vai trò.
- Quản lý master data: chuyên đề, học liệu, thiết bị nghe nhìn, định mức theo loại seminar.
- Lập lịch seminar, gán consultant, theo dõi trạng thái chuẩn bị.
- Quản lý địa điểm, hợp đồng cơ sở vật chất, đặt phòng và thiết bị AV.
- Điều phối lịch di chuyển consultant.
- Tạo và theo dõi yêu cầu học liệu, trạng thái đóng gói, vận chuyển, giao nhận.

## Công nghệ

- Backend: Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway, PostgreSQL, MinIO.
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, lucide-react.
- DevOps: Docker, Docker Compose, Nginx.

## Cấu trúc thư mục

```text
.
├── backend/              # Spring Boot API
├── frontend/             # React + Vite UI
├── docs/                 # Tài liệu phân tích thiết kế, ERD
├── docker-compose.yml    # Chạy toàn bộ hệ thống
└── README.md
```

## Chạy nhanh bằng Docker Compose

Yêu cầu:

- Docker
- Docker Compose

Chạy toàn bộ hệ thống:

```bash
docker compose up --build
```

Các địa chỉ mặc định:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- PostgreSQL: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Dừng hệ thống:

```bash
docker compose down
```

Xóa cả dữ liệu volume:

```bash
docker compose down -v
```

## Chạy thủ công khi phát triển

### 1. Chạy hạ tầng

Có thể dùng Docker Compose để chạy PostgreSQL và MinIO cùng các cấu hình mặc định trong `docker-compose.yml`.

```bash
docker compose up training-logistics-db training-logistics-minio
```

### 2. Chạy backend

Yêu cầu:

- Java 21
- Maven 3+

```bash
cd backend
mvn spring-boot:run
```

Backend đọc cấu hình từ biến môi trường hoặc file `backend/.env`. Các giá trị mặc định:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logistics_db
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=secret_password
MINIO_HOST=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=minio_secret_password
SECRET_KEY=super_secret_key_12312312312312312
```

### 3. Chạy frontend

Yêu cầu:

- Node.js 18+
- npm

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server chạy tại `http://localhost:5173`.

## Tài khoản mẫu

Database migration đã seed một số tài khoản. Mật khẩu mặc định cho tất cả tài khoản bên dưới là:

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

## Lệnh kiểm thử và build

Backend:

```bash
cd backend
mvn test
mvn clean package
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## API chính

- Auth: `/api/v1/auth`
- Users: `/api/v1/users`
- Consultants: `/api/v1/consultants`
- Seminars: `/api/v1/seminars`
- Facilities: `/api/v1/facilities`
- Facility contracts: `/api/v1/facility-contracts`
- Travel arrangements: `/api/v1/travel-arrangements`
- Material requests: `/api/v1/material-requests`
- Master data: `/api/master-data/*`, `/api/v1/master-data/*`

## Tài liệu thêm

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [ER Design](docs/er_design.md)
- [ER Diagram](docs/er_diagram.md)
