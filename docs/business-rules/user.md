# User – Business Rules (v1)
## U0 – Trạng thái user
- Mọi API protected chỉ cho phép user có status ACTIVE.

## U1 – Quyền xem danh sách user
- Chỉ ROOT và ADMIN đang active mới được xem danh sách user.
- User thường không được gọi API này.

## U2 – Thông tin user hiện tại
- Chỉ user đã đăng nhập mới lấy được thông tin của chính mình (`/users/me`).

## U3 – Xem profile user khác
- User thường chỉ được xem thông tin public.
- ADMIN được xem thêm 1 số thông tin như: email, role, status, last login.
- Không được trả về các field nhạy cảm (password, token, …).

## U4 – Cập nhật profile cá nhân
- ROOT không được sửa thông tin (trừ password).
- User chỉ được sửa thông tin cá nhân cơ bản (name, avatar, password).
- Không được sửa role, status, lock bằng API này.
- User bị lock, (soft) delete thì không được update.

## U5 – Thay đổi role
- Chỉ ROOT mới được cấp role ADMIN cho 1 tài khoản.
- Chỉ ADMIN mới được cấp role EVENT MANAGER.
- ADMIN không được tự đổi role của chính mình.
- Role phải hợp lệ theo hệ thống.

## U6 – Lock / Unlock user
- Chỉ ADMIN mới được lock / unlock user khác.
- ADMIN không được tự lock chính mình.
- User bị lock thì không đăng nhập và không gọi được API protected.

## U7 – Xóa tài khoản
- User chỉ được tự xóa tài khoản của mình (soft delete).
- User đã bị xóa thì không đăng nhập và không xuất hiện trong danh sách.
- Không xóa cứng dữ liệu.

## Notes
- Rule về **quyền truy cập** được xử lý ở middleware.