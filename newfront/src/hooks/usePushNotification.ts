import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { urlBase64ToUint8Array } from "@/utils/push-helper.utils";

export const usePushNotifications = () => {
    const subscribeUser = async () => {
        try {
            // 1. Kiểm tra trình duyệt có hỗ trợ không
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                toast.error("Trình duyệt của bạn không hỗ trợ thông báo đẩy.");
                return;
            }

            // 2. Đăng ký Service Worker
            const registration = await navigator.serviceWorker.register(
                "/sw.js"
            );
            await navigator.serviceWorker.ready;

            // 3. Xin quyền thông báo
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error(
                    "Bạn cần cho phép quyền thông báo để sử dụng tính năng này."
                );
                return;
            }

            // 4. Lấy subscription từ trình duyệt
            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            // 5. Gửi lên Backend (Khớp với Controller: { endpoint, keys: { p256dh, auth } })
            const subJSON = subscription.toJSON();

            await apiClient.post("/api/v1/notifications/subscribe", {
                endpoint: subJSON.endpoint,
                keys: {
                    p256dh: subJSON.keys?.p256dh,
                    auth: subJSON.keys?.auth,
                },
            });

            toast.success("Đã bật thông báo thành công!");
        } catch (error: any) {
            console.error("Lỗi đăng ký Push:", error);
            toast.error("Không thể bật thông báo. Vui lòng thử lại.");
        }
    };

    return { subscribeUser };
};
