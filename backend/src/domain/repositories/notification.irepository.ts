import { ListResult } from "../../application/dtos/list-result.dto";
import { CreateNotificationDto, NotificationFilterDto, PushSubscriptionResponse, SavePushSubscriptionDto } from "../../application/dtos/notification.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { Notification } from "../entities/notification.entity";

export interface INotificationRepository {
    create(data: CreateNotificationDto): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;

    findByUserId(
        userId: string,
        filter?: NotificationFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<Notification>>;

    countByUserId?(userId: string): Promise<number>;

    markAsRead?(id: string): Promise<void>;
    markAllAsRead?(userId: string): Promise<void>;

    findOwnerId(notificationId: string): Promise<string>;

    // web push api
    saveSubscription(data: SavePushSubscriptionDto): Promise<PushSubscriptionResponse>;
    getSubscriptionsByUserId(userId: string): Promise<PushSubscriptionResponse[]>;
    deleteSubscription(endpoint: string): Promise<void>;
}
