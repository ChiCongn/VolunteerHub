import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { urlBase64ToUint8Array } from "@/utils/push-helper.utils";

export const usePushNotifications = () => {
    const subscribeUser = async () => {
        try {
            // Check if the browser supports Service Worker & Push API
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                toast.error("Trình duyệt của bạn không hỗ trợ thông báo đẩy.");
                return;
            }

            // Register the Service Worker (required for Web Push)
            const registration = await navigator.serviceWorker.register(
                "/sw.js"
            );
            await navigator.serviceWorker.ready;

            // Request notification permission from the user
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error(
                    "Bạn cần cho phép quyền thông báo để sử dụng tính năng này."
                );
                return;
            }

            // Get VAPID public key from environment variables
            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            const subJSON = subscription.toJSON();

            await apiClient.post("/notifications/subscribe", {
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
