# Event – Business Rules (v1)

## E0 – Trạng thái event
- Event có các trạng thái:
  - `Pending`
  - `Approved`
  - `Rejected`
  - `Ongoing`
  - `Cancelled`
  - `Completed`
- `Ongoing` và `Completed` chỉ có thể xảy ra sau khi event đã được `Approved`.
- Việc chuyển trạng thái (`Ongoing`, `Completed`) có thể do hệ thống hoặc theo thời gian.

## E1 – Xem danh sách & chi tiết event
- Mọi người đều có thể xem event ở trạng thái:
  - `Approved`
  - `Ongoing`
  - `Completed`
- Event ở các trạng thái còn lại **không hiển thị trong danh sách public**.
- EVENT MANAGER (bao gồm owner) và ADMIN vẫn xem được event của họ ở mọi trạng thái.

## E2 – Tạo event
- Chỉ EVENT MANAGER đang active mới được tạo event.
- Event mới tạo mặc định ở trạng thái `Pending`.
- Event chưa được duyệt thì chưa public.

## E3 – Cập nhật event
- Chỉ EVENT MANAGER là **owner** của event mới được cập nhật thông tin event.
- Owner có quyền thêm EVENT MANAGER khác vào event của mình.
- Event ở trạng thái:
  - `Cancelled`
  - `Rejected`
  → **không được update**
- Event đã `Approved` hoặc `Ongoing` chỉ được sửa một số thông tin cho phép
  (không sửa nội dung cốt lõi).
- Khi thay đổi thông tin quan trọng của event, hệ thống cần thông báo
  tới những người đã tham gia event (không bao gồm user đang đăng ký).

## E4 – Hủy event
- Chỉ owner mới được hủy event.
- Hủy event là **soft cancel**:
  - chuyển trạng thái sang `Cancelled`
- Event đã bị hủy thì không được thao tác tiếp.

## E5 – Xem thống kê event
- Chỉ EVENT MANAGER (owner) của event mới được xem thống kê.
- User thường không được truy cập dữ liệu thống kê.
- Chỉ event ở trạng thái:
  - `Approved`
  - `Ongoing`
  - `Completed`
  → mới có thống kê hợp lệ.

## E6 – Duyệt / từ chối event
- Chỉ ADMIN mới được:
  - duyệt (`Approved`)
  - từ chối (`Rejected`) event.
- Event chỉ được duyệt khi đang ở trạng thái `Pending`.
- Event bị `Rejected` thì không được public.

## Notes
- Rule về **quyền truy cập** được xử lý ở middleware.
- Service layer chịu trách nhiệm enforce **business logic theo status**.
