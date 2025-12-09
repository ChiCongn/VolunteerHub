import { DomainError } from "./domain.error";

export class NotificationNotFoundError extends DomainError {
    constructor(notifId: string) {
        super("NOTIFICATION_NOT_FOUND", `Notification ${notifId} not found`, [notifId]);
    }
}

export class CannotMarkOthersNotificationError extends DomainError {
    constructor(notifId: string, userId: string) {
        super("NOT_OWN_NOTIFICATION", `User ${userId} cannot modify notification ${notifId}`, [
            userId,
            notifId,
        ]);
    }
}
