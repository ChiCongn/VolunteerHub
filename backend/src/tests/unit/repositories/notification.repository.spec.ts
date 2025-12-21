import { PrismaClient, Prisma } from "../../../infrastructure/prisma/generated/client";

import { Pagination } from "../../../application/dtos/pagination.dto";
import { SortOption } from "../../../application/dtos/sort-option.dto";
import { ListResult } from "../../../application/dtos/list-result.dto";
import { NotificationType } from "../../../domain/entities/enums";
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { restoreSnapshot } from "../../setup/test-db";
import { NotificationRepository } from "../../../infrastructure/repositories/notificatiion.repository";
import { UserNotFoundError } from "../../../domain/errors/user.error";
import { Notification } from "../../../domain/entities/notification.entity";
import { NotificationNotFoundError } from "../../../domain/errors/notification.error";

const authorId = '44d9da63-6118-4441-b1b0-c09681a3886f';
const anotherUserId = '2d033de0-7370-48aa-8f60-8aebfeae1118';
const nonExistentNotificationId = '3e5f1c2d-1234-5678-9101-112131415161';
const postId = 'b1367579-7927-495c-91b9-f215d2361d70';

const prisma = new PrismaClient();
const repo = new NotificationRepository(prisma);

beforeEach(async () => {
    await prisma.$connect();
    await restoreSnapshot();
});
afterEach(async () => {
    await prisma.$disconnect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createNotification(overrides = {}) {
    return await repo.create({
        userId: authorId,
        type: NotificationType.Event,
        message: 'This is a notification',
        redirectUrl: "redirect",
        ...overrides,
    });
}

describe('NotificationRepository', () => {
    // 01: create
    describe('create', () => {
        it('should successfully create a notification with valid DTO', async () => {
            const noti = await createNotification();
            const result = await repo.findById(noti.id);
            expect(result).toEqual(noti);
            expect(result.read).toBe(false);
        });

        it('should throw if userId is missing or invalid', async () => {
            await expect(createNotification({userId: nonExistentNotificationId})).rejects.toThrow(UserNotFoundError);
        });

        it('should allow optional redirect in DTO if schema supports', async () => {
            const notifi = await createNotification({ redirectUrl: "hehehe" });
            //expect(notifi.redirectUrl).toEqual("hehehe");
        });
    });

    // 02: findById
    describe('findById', () => {
        it('should return notification if found', async () => {
            const noti = await createNotification();
            const result = await repo.findById(noti.id);
            expect(result).toEqual(noti);
            expect(result.read).toBe(false);
        });

        it('should throw error if notification not found', async () => {
            await expect(repo.findById(nonExistentNotificationId)).rejects.toThrow(NotificationNotFoundError);

        });
    });

    // 03: findByUserId
    describe('findByUserId', () => {
        it('should return paginated list of notifications for user', async () => {
            const notiCreates = 5;
            for (let i = 0; i < notiCreates; i++) {
                await createNotification({ message: `This is comment ${i}` })
            }
            const pagination: Pagination = { page: 1, limit: 2 };
            const res = await repo.findByUserId(authorId, undefined, pagination);
            expect(res.items).toHaveLength(2);
            expect(res.total).toBe(7); // existed 2 notifications in database
        });

        it('should return all notification for user', async () => {
            const notiCreates = 5;
            for (let i = 0; i < notiCreates; i++) {
                await createNotification({ message: `This is comment ${i}` })
            }

            const res = await repo.findByUserId(authorId);
            expect(res.items).toHaveLength(7);
            expect(res.total).toBe(7); // existed 2 notifications in database
        });

        it('should return empty list if no notifications match', async () => {
            const res = await repo.findByUserId(anotherUserId);
            console.log(res);
            expect(res.items).toHaveLength(0);
        });
    });

    // 04: countByUserId
    describe('countByUserId', () => {
        it('should return correct count of notifications for user', async () => {
            const notiCreates = 5;
            for (let i = 0; i < notiCreates; i++) {
                await createNotification({ message: `This is comment ${i}` })
            }
            const total = await repo.countByUserId(authorId);
            expect(total).toBe(7);
        });

        it('should return 0 if user has no notifications', async () => {
            const total = await repo.countByUserId(anotherUserId);
            expect(total).toBe(0);
        });
    });

    // 05: markAsRead
    describe('markAsRead', () => {
        it('should successfully mark a notification as read', async () => {
            const noti = await createNotification();
            await expect(repo.markAsRead(noti.id)).resolves.toBeUndefined();
        });

        it('should throw NotificationNotFoundError if notification does not exist', async () => {
            await expect(repo.markAsRead(nonExistentNotificationId)).rejects.toThrow(NotificationNotFoundError);
        });

        it('should allow marking already-read notification (idempotent)', async () => {
            const noti = await createNotification();
            await expect(repo.markAsRead(noti.id)).resolves.toBeUndefined();
            await expect(repo.markAsRead(noti.id)).resolves.toBeUndefined();
        });
    });

    // 06: markAllAsRead
    describe('markAllAsRead', () => {
        it('should successfully mark all user notifications as read', async () => {
            const notiCreates = 5;
            for (let i = 0; i < notiCreates; i++) {
                await createNotification({ message: `This is comment ${i}` })
            }
            await expect(repo.markAllAsRead(authorId)).resolves.toBeUndefined();
        });

        it('should throw if userId is invalid', async () => {
            await expect(repo.markAllAsRead(nonExistentNotificationId)).rejects.toThrow(UserNotFoundError);
        });
    });
});