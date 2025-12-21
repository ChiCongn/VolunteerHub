# Reaction – Business Rules (v1)

## R0 – Phạm vi & đối tượng
- Reaction luôn thuộc về **1 post**.
- Reaction có:
  - 1 author (user tạo reaction)
  - 1 type (ví dụ: `like`, `love`, `haha`, ...)
- Mỗi user **chỉ được tồn tại 1 reaction trên mỗi post**.
- Không hỗ trợ multiple reactions cho cùng 1 user trên 1 post.

## R1 – Xem danh sách reaction
- Chỉ các đối tượng sau được xem reaction của post:
  - participant của event
  - EVENT MANAGER của event
- Post phải thuộc event ở trạng thái:
  - `Approved`
  - `Ongoing`
  - `Completed`

## R2 – Tạo reaction
- Chỉ user đã đăng nhập mới được tạo reaction.
- Chỉ được tạo reaction khi:
  - post thuộc event ở trạng thái `Approved` hoặc `Ongoing`
- Người tạo reaction phải là:
  - participant của event
  - hoặc EVENT MANAGER của event
- User chỉ được reaction trong event mà họ **tham gia hoặc quản lý**.
- Nếu user đã reaction post đó:
  - không được tạo reaction mới (trả về `409 Conflict`).

## R3 – Cập nhật reaction
- Chỉ author của reaction được sửa reaction.
- Chỉ cho phép:
  - thay đổi **reaction type**
- Không được thay đổi:
  - author
  - post
- Reaction thuộc post của event đã `Cancelled` thì không được update.

## R4 – Xóa reaction
- Chỉ author của reaction được xóa reaction:
- Xóa reaction là **hard delete**.

## R5 – Ảnh hưởng của trạng thái event
- Event ở trạng thái:
  - `Cancelled`
  - `Rejected`
  → không cho tạo reaction mới.
- Event chưa `Approved`:
  - không hiển thị reaction cho user thường.

## Notes
- Rule về **xác thực & phân quyền** được xử lý ở middleware.
- Service layer chịu trách nhiệm enforce:
  - unique `(user_id, post_id)`
  - business logic theo event & role.
