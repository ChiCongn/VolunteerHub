import { EventStatus, RegistrationStatus } from "../../domain/entities/enums";
import { Event, IEvent } from "../../domain/entities/event.entity";
import { EventAlreadyApprovedError, EventNotFoundError } from "../../domain/errors/event.error";
import { IEventRepository } from "../../domain/repositories/event.irepository";
import { eventRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { EventAuthInfo } from "../dtos/event.dto";
import { DailyPostDto } from "../dtos/stats";
import { notificationService, NotificationService } from "./notification.service";

export class EventService {
    constructor(
        private readonly eventRepo: IEventRepository,
        private readonly notificationService: NotificationService
    ) {}

    async findOwnerId(eventId: string) {
        logger.debug(
            { eventId, action: "findOwnerId" },
            "[EventService] Fetching owner id of this event"
        );
        return this.eventRepo.findOwner(eventId);
    }

    async findManagerIds(eventId: string) {
        logger.debug(
            { eventId, action: "findManagerIds" },
            "[EventService] Fetching manager ids of this event"
        );
        return this.eventRepo.findManagers(eventId);
    }

    async isParticipant(userId: string, eventId: string) {
        logger.debug(
            { userId, eventId, action: "isParticipant" },
            "[EventService] Whether this user is a participant of this event"
        );
        const status = await this.eventRepo.getRegistrationStatus(userId, eventId);
        return status === RegistrationStatus.Approved;
    }

    async getEventPostActivity(eventId: string, days: number = 7): Promise<DailyPostDto[]> {
        return await this.eventRepo.getPostsDays(eventId, days);
    }

    async approveEvent(eventId: string) {
        const event = await this.eventRepo.findById(eventId);

        if (!event) {
            logger.warn({ eventId }, "[EventService] Event not found");
            throw new EventNotFoundError(eventId);
        }

        if (event.status === EventStatus.Approved) {
            logger.warn(
                { eventId, action: "approveEent" },
                "[EventService] Event already approved"
            );
            throw new EventAlreadyApprovedError(eventId);
        }

        await this.eventRepo.approveEvent(eventId);

        // notification
        // fire-and-forget (do not block approval)
        void this.notifyEventApproved(event, true);
    }

    async rejectEvent(eventId: string, reason: string) {
        const event = await this.eventRepo.findById(eventId);

        if (!event) {
            logger.warn({ eventId, action: "rejectEvent" }, "[EventService] Event not found");
            throw new EventNotFoundError(eventId);
        }

        if (event.status === EventStatus.Approved) {
            logger.warn(
                { eventId, action: "approve event" },
                "[EventService] Event already approved"
            );
            throw new EventAlreadyApprovedError(eventId);
        }

        await this.eventRepo.rejectEvent(eventId, reason);

        // notification
        // fire-and-forget (do not block approval)
        void this.notifyEventApproved(event, false);
    }

    async getEventAuthInfo(eventId: string): Promise<EventAuthInfo> {
        const authInfo = await this.eventRepo.getEventAuthInfo(eventId);

        if (!authInfo) {
            throw new EventNotFoundError(eventId);
        }

        return authInfo;
    }

    async getTrendingEvents(limit = 10) {
        const candidates = await this.eventRepo.getTrendingCandidates(50);

        return candidates
            .map((event) => ({
                event,
                score: this.calculateTrendingScore(event),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ event }) => ({
                id: event.id,
                ownerId: event.ownerId,
                name: event.name,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                description: event.description,
                imageUrl: event.imageUrl,
                categories: event.categories,
                status: event.status,
                capacity: event.capacity,
                registerCount: event.registerCount,
                updatedAt: event.updatedAt,
            }));
    }

    private calculateTrendingScore(event: IEvent): number {
        const now = Date.now();

        const createdAt = new Date(event.createdAt).getTime();
        const updatedAt = new Date(event.updatedAt).getTime();

        const ageHours = (now - createdAt) / (1000 * 60 * 60);

        const registerCount = event.registerCount;

        const capacityFillRate = event.capacity > 0 ? registerCount / event.capacity : 0;

        const recentActivityBoost = now - updatedAt < 12 * 60 * 60 * 1000 ? 15 : 0;

        const timeDecayPenalty = Math.pow(ageHours, 1.2);

        const score =
            registerCount * 1.5 + capacityFillRate * 35 + recentActivityBoost - timeDecayPenalty;

        return Number(score.toFixed(2));
    }

    private async notifyEventApproved(event: IEvent, isApprove: boolean) {
        const managers = event.eventManagerIds;
        const statusText = isApprove ? "đã được phê duyệt" : "đã bị từ chối";
        const message = `Đơn đăng ký tham gia sự kiện "${event.name}" của bạn ${statusText}.`;

        logger.debug(
            { eventId: event.id, managersCount: managers.length },
            "[EventService] Sending approval notifications"
        );

        for (const managerId of managers) {
            try {
                await this.notificationService.notifyEventUpdate(
                    managerId,
                    event.name,
                    message,
                    event.id
                );

                await this.notificationService.sendNotification(
                    managerId,
                    event.name,
                    message,
                    `/events/${event.id}`
                );
            } catch (error) {
                logger.error(
                    { error, eventId: event.id, managerId },
                    "[EventService] Failed to send notification"
                );
            }
        }
    }
}

export const eventService = new EventService(eventRepo, notificationService);
