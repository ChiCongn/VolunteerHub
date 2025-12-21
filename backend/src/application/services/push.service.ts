import webpush from "web-push";
import { INotificationRepository } from "../../domain/repositories/notification.irepository";
import { SavePushSubscriptionDto } from "../dtos/notification.dto";

webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

// export const pushNotificationService = {
//     // Gửi thông báo cho 1 người dùng cụ thể
//     async sendToUser(userId: string, title: string, body: string, url: string = "/") {
//         const subscriptions = await prisma.userSubscription.findMany({
//             where: { userId },
//         });

//         const notifications = subscriptions.map((sub) => {
//             const pushConfig = {
//                 endpoint: sub.endpoint,
//                 keys: { auth: sub.auth, p256dh: sub.p256dh },
//             };

//             return webpush
//                 .sendNotification(pushConfig, JSON.stringify({ title, body, url }))
//                 .catch((err) => {
//                     if (err.statusCode === 410) {
//                         // Token hết hạn hoặc user đã chặn
//                         return prisma.userSubscription.delete({ where: { id: sub.id } });
//                     }
//                 });
//         });

//         await Promise.all(notifications);
//     },
// };

export class PushService {
    async send(subscription: any, payload: any) {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    }
}

export class NotificationService {
    constructor(private notificationRepo: INotificationRepository) {
        webpush.setVapidDetails(
            "mailto:admin@volunteerhub.com",
            process.env.VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );
    }

    async subscribe(subscriptionData: SavePushSubscriptionDto) {
        return await this.notificationRepo.saveSubscription(subscriptionData);
    }

    async sendNotification(userId: string, title: string, body: string, url: string) {
        const subs = await this.notificationRepo.getSubscriptionsByUserId(userId);

        const tasks = subs.map((sub) => {
            const payload = JSON.stringify({ title, body, url });
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: { auth: sub.auth, p256dh: sub.p256dh },
            };

            return webpush.sendNotification(pushConfig, payload).catch(async (err) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await this.notificationRepo.deleteSubscription(sub.endpoint);
                }
            });
        });

        await Promise.all(tasks);
    }
}

export const pushService = new PushService();
