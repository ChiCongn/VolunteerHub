# Registration – Business Rules (v1)

## R0 – Trạng thái đăng ký (registration)
- Registration có các trạng thái:
  - `Pending`
  - `Approved`
  - `Rejected`
- Mỗi registration luôn gắn với **1 user** và **1 event**.

## R1 – Đăng ký tham gia event
- Chỉ (active) user đã đăng nhập mới được đăng ký event.
- User chỉ được đăng ký khi:
  - event ở trạng thái `Approved` hoặc `Ongoing`
  - event còn trống số lượng
- User có thể:
  - withdraw rồi đăng ký lại
  - **không được đăng ký lại nếu registration đã bị `Rejected`**
- Khi đăng ký thành công:
  - tạo registration với trạng thái `Pending`.

---

## R2 – Hủy đăng ký (withdraw)
- User chỉ được hủy registration của **chính mình**.
- Chỉ được hủy khi registration đang ở trạng thái:
  - `Pending`
  - `Approved`

- Khi hủy đăng ký thì xóa luôn đăng ký đó.

## R3 – Xem danh sách đăng ký
- Chỉ EVENT MANAGER (owner) mới được xem danh sách registration của event.
- Danh sách registration có thể filter theo:
  - status
  - user
- Volunteer thường không được xem danh sách registration của event.

## R4 – Duyệt / từ chối đăng ký
- Chỉ EVENT MANAGER (owner) mới được duyệt hoặc từ chối registration.
- Registration chỉ được duyệt khi đang ở trạng thái `Pending`.
- Khi duyệt:
  - chuyển trạng thái sang `Approved`
- Khi từ chối:
  - chuyển trạng thái sang `Rejected`

## R5 – Ảnh hưởng của trạng thái event
- Event ở trạng thái:
  - `Cancelled`
  - `Rejected`
  → không cho tạo registration mới.
- Event bị `Cancelled`:
  - không cho approve registration đang `Pending`.

## Notes
- Rule về **xác thực & quyền truy cập** được xử lý ở middleware.
- Service layer chịu trách nhiệm enforce **business logic theo status**.
