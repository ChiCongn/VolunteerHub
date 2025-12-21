import { INotificationRepository } from "../../domain/repositories/notification.irepository";
import { notificationRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { CreateNotificationDto } from "../../application/dtos/notification.dto";
import { NotificationType } from "../../domain/entities/enums";
import webpush from "web-push";
import { SavePushSubscriptionDto } from "../dtos/notification.dto";
webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export class NotificationService {
    constructor(private notificationRepo: INotificationRepository) {
        webpush.setVapidDetails(
            "mailto:admin@volunteerhub.com",
            process.env.VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );
    }

    async create(data: CreateNotificationDto) {
        return this.notificationRepo.create(data);
    }

    async notifyEventUpdate(
        recipientId: string,
        eventName: string,
        message: string,
        eventId: string
    ) {
        return this.create({
            userId: recipientId,
            type: NotificationType.Event,
            message: message,
            redirectUrl: `/events/${eventId}`,
        });
    }

    async notifyUserInteraction(
        recipientId: string,
        senderName: string,
        action: string,
        postId: string
    ) {
        return this.create({
            userId: recipientId,
            type: NotificationType.User,
            message: `**Một người dùng** ${action}`,
            redirectUrl: `/posts/${postId}`,
        });
    }

    async notifySystemAlert(recipientId: string, message: string) {
        return this.create({
            userId: recipientId,
            type: NotificationType.System,
            message: message,
            redirectUrl: `/settings`,
        });
    }

    async findOwnerId(notificationId: string) {
        logger.debug(
            { action: "findOwnerId" },
            `[NotificationService] Fetching owner id of this notification ${notificationId}`
        );

        return this.notificationRepo.findOwnerId(notificationId);
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

export const notificationService = new NotificationService(notificationRepo);
