import { NotificationType } from '../../domain/entities/enums';

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