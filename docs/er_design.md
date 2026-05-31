1. Mô tả các quan hệ và thuộc tính

**SEMINAR\_TYPE**

Lưu thông tin về loại seminar mà công ty tổ chức.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| seminar\_type\_id |  | PK |
| type\_name | Tên loại seminar |  |
| description | Mô tả về loại seminar này |  |
| duration (h) | Thời lượng seminar dự kiến theo số giờ | \>0 |
| arrangement\_notes | Ghi chú về cách bố trí phòng, chỗ ngồi hoặc yêu cầu tổ chức của loại seminar này. |  |

**SEMINAR**

Lưu thông tin về một seminar cụ thể đã được lên lịch do Booking Department.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| seminar\_id |  | PK |
| seminar\_type\_id |  | FK tới SEMINAR\_TYPE |
| consultant\_id |  | FK tới CONSULTANT |
| seminar\_name | Tên seminar cụ thể |  |
| start\_date | Ngày bắt đầu seminar |  |
| end\_date | Ngày kết thúc seminar | Trước start\_date |
| city | Thành phố nơi seminar được tổ chức |  |
| anticipated\_registrants | Số lượng người tham dự dự kiến. |  |
| booking\_created\_date | Ngày booking department tạo lịch seminar. |  |
| note | Ghi chú thêm cho seminar |  |
| employee\_id | Nhân viên phụ trách, được gán khi tạo draft contract | FK tới EMPLOYEE, NULL khi mới tạo seminar |

**CONSULTANT**

Lưu thông tin về chuyên gia đào tạo.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| consultant\_id |  | PK |
| full\_name | Họ tên consultant |  |
| phone | Số điện thoại liên hệ |  |
| email | Email liên hệ |  |
| address | Địa chỉ của consultant |  |
| city | Thành phố nơi consultant sinh sống hoặc làm việc |  |
| country | Quốc gia của consultant |  |
| work | Chuyên môn, vị trí công việc hoặc lĩnh vực đào tạo của consultant. |  |

**FACILITY**

Lưu thông tin về địa điểm/cơ sở tổ chức seminar

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| facility\_id |  | PK |
| facility\_name | Tên địa điểm/cơ sở tổ chức |  |
| address | Địa chỉ facility |  |
| city | Thành phố của facility |  |
| phone | Số điện thoại liên hệ chung của facility |  |
| email | Email liên hệ chung của facility |  |
| sales\_manager\_name | Tên sales manager phụ trách facility |  |
| sales\_manager\_phone | Số điện thoại sales manager |  |
| sales\_manager\_email | Email sales manager |  |
| number\_of\_room | Số phòng họp ở facility |  |
| cost\_for\_each\_day | Giá tiền tham khảo để tổ chức trọn gói ở facility theo ngày |  |

**SEMINAR\_FACILITY\_CONTRACT**

Lưu thông tin hợp đồng/thoả thuận đặt facility cho mỗi seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| contract\_id |  | PK |
| senimar\_id |  | FK đến SEMINAR |
| facility\_id |  | FK đến FACILITY |
| reservation\_date | Ngày đặt facility |  |
| contract\_created\_date | Ngày tạo hợp đồng | NULL nếu chưa SIGNED |
| status | Trạng thái hợp đồng | NOTSIGNED/SIGNED |
| total\_cost | Giá chốt với facility | NULL nếu chưa SIGNED |

TODO khi triển khai Contract module:

- Khi coordinator tạo draft contract cho một seminar, hệ thống phải gán `SEMINAR.employee_id` bằng ID của user đang đăng nhập.
- Việc tạo draft contract và gán `employee_id` phải nằm trong cùng transaction để tránh contract được tạo nhưng seminar chưa được nhận phụ trách.
- Không nhận `employee_id` từ frontend cho thao tác tạo draft contract; backend phải lấy từ authenticated user.
- Nếu seminar đã có `employee_id`, cần kiểm tra rule nghiệp vụ: cho phép cùng employee tiếp tục chỉnh sửa, hoặc trả `409 Conflict` nếu employee khác tạo draft contract.
- Cần kiểm soát để một seminar không có nhiều draft contract active ngoài ý muốn.

**CONTRACT\_DOCUMENT**

Lưu thông tin về file hợp đồng.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| document\_id |  | PK |
| contract\_id |  | FK đến SEMINAR\_FACILITY\_CONTRACT  |
| file\_name | Tên file tài liệu |  |
| file\_type | Định dạng file được lưu trữ trong hệ thống |  |
| file\_url | Đường dẫn đến file scan/tài liệu được lưu trong hệ thống |  |
| uploaded\_at | Thời điểm tài liệu được upload |  |
| notes | Ghi chú thêm về tài liệu |  |

**FACILITY\_ROOM\_RESERVATION**

Lưu thông tin các phòng được đặt trong hợp đồng.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| room\_id |  | PK |
| contract\_id |  | FK đến SEMINAR\_FACILITY\_CONTRACT  |
| num\_seats | Số chỗ ngồi trong phòng |  |
| start\_time | Thời gian bắt đầu sử dụng phòng |  |
| end\_time | Thời gian kết thúc sử dụng phòng |  |
| room\_width | Chiều rộng phòng |  |
| room\_length | Chiều dài phòng |  |
| seat\_arrangement\_notes | Ghi chú về cách bố trí chỗ ngồi trong phòng |  |
| room\_cost | Giá sử dụng phòng này |  |

**TRAVEL\_ARRANGEMENT**

Lưu thông tin sắp xếp di chuyển cho consultant.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| travel\_arrangement\_id |  | PK |
| seminar\_id |  | FK đến SEMINAR  |
| consultant\_id |  | FK đến CONSULTANT |
| travel\_agency\_name | Tên đại lý du lịch hợp tác |  |
| transport\_mode | Phương thức di chuyển |  |
| carrier\_name | Tên hãng vận chuyển (nếu có) |  |
| service\_number | Số chuyến bay, số tàu hoặc mã dịch vụ (nếu có) |  |
| departure\_location | Địa điểm khởi hành |  |
| arrival\_location | Địa điểm đến |  |
| departure\_time | Thời gian khởi hành |  |
| arrival\_time | Thời gian đến |  |
| seat\_info | Thông tin ghế (nếu có) |   |
| cost | Giá đã thoả thuận với travel agency (nếu có) |  |
| confirmation\_sent\_date | Ngày gửi xác nhận/lịch trình cho consultant |  |
| travel\_arrangement\_status | Consultant xác nhận lịch trình | CONFIRM/NOTCONFIRM |

**MATERIAL**

Lưu thông tin vật tư/tài liệu dùng cho seminar mà MATERIAL DEPARTMENT quản lý.

Hệ thống không quản lý cụ thể số lượng cụ thể của MATERIAL mà chỉ lưu thông tin chung.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| material\_id |  | PK |
| material\_name | Tên vật tư/tài liệu |  |
| material\_type | Loại vật tư |  |
| description | Mô tả về vật tư |  |
| unit | Đơn vị tính |  |

**MATERIAL\_REQUIREMENT**

Lưu danh sách vật tư cần cho từng loại seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| seminar\_type\_id |  | PK, FK đến SEMINAR\_TYPE |
| material\_id |  | PK, FK đến MATERIAL |
| default\_quantity | Số lượng mặc định cần dùng |  |
| is\_depend\_on\_num\_participant | Có phụ thuộc vào số lượng người đăng kí hay không |  |
| participant\_per\_quantity | Số lượng người sử dụng cho mỗi vật tư | NULL nếu is\_depend\_on\_num\_participant \= false |
| notes | Ghi chú thêm về yêu cầu vật tư |  |

**MATERIAL\_REQUEST**

Lưu phần thông tin chung của một yêu cầu gửi vật tư cho một seminar cụ thể.

Trong phiên bản hiện tại, Contract chưa được triển khai nên yêu cầu vật tư liên kết trực tiếp với SEMINAR. Sau khi SEMINAR\_FACILITY\_CONTRACT được triển khai, contract\_id sẽ được dùng để liên kết tới hợp đồng đã ký, đồng thời vẫn giữ seminar\_id để truy vấn và kiểm tra tính nhất quán.

Một yêu cầu vật tư có thể gồm nhiều dòng vật tư trong MATERIAL\_REQUEST\_ITEM.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| material\_request\_id |  | PK |
| seminar\_id |  | FK tới SEMINAR |
| contract\_id |  | FK tới SEMINAR\_FACILITY\_CONTRACT sau khi Contract được triển khai; NULL trong phiên bản hiện tại |
| request\_date | Ngày tạo yêu cầu vật tư |  |
| needed\_by\_date | Ngày cần nhận vật tư tại facility | Sau hoặc bằng request\_date |
| shipment\_status | Trạng thái vận chuyển | REQUESTED/PACKED/SHIPPED/DELIVERED |
| delivered\_confirmed\_at | Thời điểm coordinator xác nhận đã nhận vật tư | NULL nếu chưa DELIVERED |
| delivery\_confirmation\_note | Ghi chú khi xác nhận đã nhận vật tư |  |
| notes | Ghi chú thêm về yêu cầu hoặc shipment |  |
| created\_at | Thời điểm bản ghi được tạo |  |
| updated\_at | Thời điểm bản ghi được cập nhật gần nhất |  |

**MATERIAL\_REQUEST\_ITEM**

Lưu từng dòng vật tư trong một yêu cầu gửi vật tư.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| material\_request\_id |  | PK, FK tới MATERIAL\_REQUEST |
| material\_id |  | PK, FK tới MATERIAL |
| requested\_quantity | Số lượng vật tư được yêu cầu gửi | \>0 |
| notes | Ghi chú thêm cho dòng vật tư |  |

**AUDIO\_VISUAL\_EQUIPMENT**

Lưu danh mục thiết bị nghe nhìn.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| equipment\_id |  | PK |
| equipment\_name | Tên thiết bị |  |
| equipment\_type | Loại thiết bị |  |
| unit | Đơn vị tính |  |

**AV\_EQUIPMENT\_REQUIREMENT**

Lưu thiết bị AV mặc định cần cho từng loại seminar.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| equipment\_id |  | PK, FK đến AUDIO\_VISUAL\_EQUIPMENT  |
| seminar\_type\_id |  | PK, FK đến SEMINAR\_TYPE |
| quantity\_required | Số lượng thiết bị cần cho loại seminar. |  |
| is\_depend\_on\_num\_participant | Số lượng thiết bị có phụ thuộc vào số lượng người tham gia không |  |
| participant\_per\_quantity | Số lượng người sử dụng cho từng thiết bị | NULL nếu is\_depend\_on\_num\_participant \= false |

**AV\_EQUIPMENT\_RESERVATION**

Lưu thiết bị AV thực tế được thuê trong hợp đồng với facility.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| contract\_id |  | PK, FK đến SEMINAR\_FACILITY\_CONTRACT  |
| equipment\_id |  | PK, FK đến AUDIO\_VISUAL\_EQUIPMENT |
| quantity\_reserved | Số lượng thiết bị đã được reserved |  |
| cost\_for\_each\_equipment | Giá thuê cho mỗi equipment |  |

**EMPLOYEE**

Lưu các nhân viên trong bộ phận tổ chức.

| Attribute | Mô tả | Ràng buộc |
| :---- | :---- | :---- |
| employee\_id |  | PK  |
| full\_name | Họ tên đầy đủ của nhân viên |  |
| email | Email của nhân viên |  |
| phone | SĐT của nhân viên |  |
| role | Chức danh |  |
