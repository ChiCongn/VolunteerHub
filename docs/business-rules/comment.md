# Comment – Business Rules (v1)

## C0 – Phạm vi & đối tượng
- Comment luôn thuộc về **1 post**.
- Comment có:
  - 1 author
- Hệ thống **không hỗ trợ reply / threaded comment** (không có parent comment).

## C1 – Xem danh sách comment
- Chỉ các đối tượng sau được xem comment của post:
  - participant của event
  - EVENT MANAGER của event
- Post phải thuộc event ở trạng thái:
  - `Approved`
  - `Ongoing`
  - `Completed`.

## C2 – Tạo comment
- Chỉ user đã đăng nhập mới được tạo comment.
- Chỉ được tạo comment khi:
  - post thuộc event ở trạng thái `Approved` hoặc `Ongoing`
- Người tạo comment phải là:
  - participant của event
  - hoặc EVENT MANAGER của event
- User chỉ được comment trong event mà họ **tham gia hoặc quản lý**.

## C3 – Cập nhật comment
- Chỉ author của comment được sửa comment.
- Comment thuộc post của event đã `Cancelled` thì không được update.
- Không được thay đổi author của comment.

## C4 – Xóa comment
- Chỉ các đối tượng sau được xóa comment:
  - author của comment
  - EVENT MANAGER của event
- Xóa comment là **hard delete**.
- Comment đã bị xóa thì không được thao tác tiếp.

## C5 – Ảnh hưởng của trạng thái event
- Event ở trạng thái:
  - `Cancelled`
  - `Rejected`
  → không cho tạo comment mới.

## Notes
- Rule về **xác thực & phân quyền** được xử lý ở middleware.
- Service layer chịu trách nhiệm enforce **business logic theo event & role**.
