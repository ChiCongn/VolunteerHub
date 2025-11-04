import { NotificationType } from "../../application/dtos/enums"

export interface CreateNotificationProps {
    id: string,
    userId: string,
    message: string,
    redirectUrl: string,
    read: boolean,
    type: NotificationType,
    createdAt: Date,
}