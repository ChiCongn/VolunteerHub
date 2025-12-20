import { INotificationRepository } from "../../domain/repositories/notification.irepository";
import { PrismaClient, notifications as PrismaNotification } from "../prisma/generated/client";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import logger from "../../logger";
import {
    CreateNotificationDto,
    NotificationFilterDto,
} from "../../application/dtos/notification.dto";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationNotFoundError } from "../../domain/errors/notification.error";
import { UserNotFoundError } from "../../domain/errors/user.error";

export class NotificationRepository implements INotificationRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateNotificationDto): Promise<Notification> {
        logger.debug(
            { userId: data.userId, action: "create notification" },
            "[NotificationRepository] Creating notification for user"
        );
        const notifId = await this.insert(data);
        return this.findById(notifId);
    }

    async findById(id: string): Promise<Notification> {
        logger.debug(
            { notificationId: id, action: "find notification by id" },
            "[NotificationRepository] Fetching notification by id"
        );
        const notification = await this.prisma.notifications.findUnique({
            where: { id },
        });

        if (!notification) {
            logger.warn(
                { notificationId: id, action: "find notification by id" },
                "[NotificationRepository] Notification not found"
            );
            throw new NotificationNotFoundError(id);
        }

        return this.toDomain(notification);
    }

    async findByUserId(
        userId: string,
        filters?: NotificationFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<Notification>> {
        logger.debug(
            { userId, filters, pagination, sort, action: "list notifications" },
            "[NotificationRepository] Fetching notifications for user"
        );
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        conditions.push(`user_id = $${idx}::uuid`);
        params.push(userId);
        idx++;

        if (filters?.read) {
            conditions.push(`read = $${idx}`);
            params.push(filters.read);
            idx++;
        }
        if (filters?.type) {
            conditions.push(`type = $${idx}`);
            params.push(`%${filters.type}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        logger.debug(`Where clause: ${whereClause}`);

        // Order clause
        const sortableFields = new Set(["type", "created_at"]);
        let orderBy: string;

        if (sort && sortableFields.has(sort.field)) {
            const order = sort.order?.toLowerCase() === "asc" ? "ASC" : "DESC";
            orderBy = `${sort.field} ${order}`;
        } else {
            orderBy = "created_at DESC";
        }

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

        // Total count
        const total = await this.count(userId, filters);

        const prismaNotifications = await this.prisma.$queryRawUnsafe<PrismaNotification[]>(
            `
            SELECT id, user_id, message, type, redirect_url, created_at
            FROM notifications
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ${limit} 
            OFFSET ${offset};`,
            ...params
        );
        const items: Notification[] = [];
        for (const prismaNotification of prismaNotifications) {
            const noti = this.toDomain(prismaNotification);
            items.push(noti);
        }
        return { items, total, page, limit };
    }

    async count(userId: string, filters?: NotificationFilterDto) {
        logger.debug(
            { userId, filters, action: "count notifications" },
            "[NotificationRepository] Counting notifications for user"
        );
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        conditions.push(`user_id = $${idx}::uuid`);
        params.push(userId);
        idx++;

        if (filters?.read !== undefined) {
            conditions.push(`read = $${idx}`);
            params.push(filters.read);
            idx++;
        }
        if (filters?.type) {
            conditions.push(`type = $${idx}`);
            params.push(`%${filters.type}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        logger.debug(`Where clause: ${whereClause}`);

        const [result] = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
            `
            SELECT COUNT(*) FROM notifications
            ${whereClause};`,
            ...params
        );
        const total = Number(result.count);
        return total;
    }

    async countByUserId(userId: string): Promise<number> {
        logger.debug(
            { userId, action: "count unread notifications" },
            "[NotificationRepository] Counting total notifications for user"
        );
        return this.prisma.notifications.count({
            where: { user_id: userId },
        });
    }

    async markAsRead(id: string): Promise<void> {
        logger.debug(
            { notificationId: id, action: "mark as read" },
            "[NotificationRepository] Marking notification as read"
        );
        const noti = await this.prisma.notifications.findUnique({ where: { id } });
        if (!noti) {
            logger.warn(
                { notificationId: id, action: "mark as read" },
                "[NotificationRepository] Notification not found"
            );
            throw new NotificationNotFoundError(id);
        }
        await this.prisma.notifications.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        logger.debug(
            { userId, action: "mark all as read" },
            "[NotificationRepository] Marking all notifications as read"
        );
        const user = await this.prisma.users.findUnique({ where: { id: userId } });
        if (!user) {
            logger.warn(
                { userId, action: "mark all as read" },
                "[NotificationRepository] User not found"
            );
            throw new UserNotFoundError(userId);
        }
        await this.prisma.notifications.updateMany({
            where: { user_id: userId, read: false },
            data: { read: true },
        });
    }

    async findOwnerId(notificationId: string): Promise<string> {
        logger.debug(
            { action: "findOwnerId" },
            `[NotificationRepository] Fetching owner id of this notification ${notificationId}`
        );

        const notification = await this.prisma.notifications.findUnique({
            where: { id: notificationId },
            select: { user_id: true },
        });

        if (!notification) {
            logger.warn(
                { notificationId, action: "findOwnerId" },
                "[NotificationRepository] Notification not found"
            );
            throw new NotificationNotFoundError(notificationId);
        }

        return notification.user_id;
    }

    private async insert(data: CreateNotificationDto): Promise<string> {
        logger.trace(
            { userId: data.userId, type: data.type, action: "insert notification" },
            "[NotificationRepository] Inserting notification into database"
        );
        const user = await this.prisma.users.findUnique({ where: { id: data.userId } });
        if (!user) {
            logger.warn(
                { userId: data.userId, action: "insert notification" },
                "[NotificationRepository] User not found"
            );
            throw new UserNotFoundError(data.userId);
        }
        const notification = await this.prisma.notifications.create({
            data: {
                user_id: data.userId,
                message: data.message,
                type: data.type,
                redirect_url: data.redirectUrl ?? "",
            },
        });
        return notification.id;
    }

    private toDomain(p: PrismaNotification): Notification {
        logger.debug(
            { notificationId: p.id, action: "map to domain" },
            "[NotificationRepository] Mapping Prisma → Domain Notification"
        );
        return new Notification({
            id: p.id,
            userId: p.user_id,
            message: p.message,
            type: p.type,
            redirectUrl: p.redirect_url ?? "",
            read: p.read,
            createdAt: p.created_at,
        });
    }
}
