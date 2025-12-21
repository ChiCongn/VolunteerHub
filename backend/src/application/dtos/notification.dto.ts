import { NotificationType } from "../../domain/entities/enums";

export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    message: string;
    redirectUrl?: string;
}

export interface NotificationFilterDto {
    read?: boolean;
    type?: NotificationType;
}

export interface SavePushSubscriptionDto {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}

export interface PushSubscriptionResponse {
    id: string;
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}
