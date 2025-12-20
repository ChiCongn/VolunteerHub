import { INotificationRepository } from "../../domain/repositories/notification.irepository";
import { notificationRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { CreateNotificationDto } from "../../application/dtos/notification.dto";
import { NotificationType } from "../../domain/entities/enums";

export class NotificationService {
    constructor(private readonly notificationRepo: INotificationRepository) {}

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
            message: `**${senderName}** ${action}`,
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
}

export const notificationService = new NotificationService(notificationRepo);
