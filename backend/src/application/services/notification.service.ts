import { INotificationRepository } from "../../domain/repositories/notification.irepository";
import { notificationRepo } from "../../infrastructure/repositories";
import logger from "../../logger";

export class NotificationService {
    constructor(private readonly notificationRepo: INotificationRepository) {}

    async findOwnerId(notificationId: string) {
        logger.debug(
            { action: "findOwnerId" },
            `[NotificationService] Fetching owner id of this notification ${notificationId}`
        );

        return this.notificationRepo.findOwnerId(notificationId);
    }
}

export const notificationService = new NotificationService(notificationRepo);
