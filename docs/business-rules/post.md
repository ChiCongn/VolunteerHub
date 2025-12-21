# Post – Business Rules (v1)

## P0 – Phạm vi & đối tượng
- Post luôn thuộc về **1 event**.
- Mỗi post có:
  - 1 author (user tạo post)

## P1 – Xem danh sách & chi tiết post
- Mọi user đều có thể xem post của event ở trạng thái:
  - `Approved`
  - `Ongoing`
  - `Completed`
- Event chưa được duyệt hoặc đã bị `Cancelled` thì không hiển thị post public.
- EVENT MANAGER vẫn xem được post của event mình quản lý ở mọi trạng thái.

## P2 – Tạo post
- Chỉ user đã đăng nhập mới được tạo post.
- Chỉ được tạo post khi event ở trạng thái:
  - `Approved`
  - `Ongoing`
- Người tạo post phải là:
  - participant của event  
  - hoặc EVENT MANAGER của event
- User chỉ được tạo post trong event mà họ **tham gia hoặc quản lý**.

## P3 – Cập nhật post
- Chỉ author của post được sửa post.
- Post thuộc event đã `Cancelled` thì không được update.
- Không được thay đổi author của post.

## P4 – Xóa post
- Chỉ các đối tượng sau được xóa post:
  - author của post
  - EVENT MANAGER của event
- Xóa post là **soft delete**.
- Post đã bị xóa thì không được thao tác tiếp.

## P5 – Restore post
- Chỉ EVENT MANAGER mới được restore post của event đó.
- Chỉ restore được post đã bị **soft delete**.

## P6 – Ảnh hưởng của trạng thái event
- Event ở trạng thái:
  - `Cancelled`
  - `Rejected`
  → không cho tạo post mới.
- Event chưa `Approved`:
  - không hiển thị post public.

## Notes
- Rule về **xác thực & phân quyền** được xử lý ở middleware.
- Service layer chịu trách nhiệm enforce **business logic theo event & role**.
