import { EventStatus, RegistrationStatus } from "../../domain/entities/enums";
import { Event } from "../../domain/entities/event.entity";
import { EventAlreadyApprovedError, EventNotFoundError } from "../../domain/errors/event.error";
import { IEventRepository } from "../../domain/repositories/event.irepository";
import { eventRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
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

    async approveEvent(eventId: string) {
        const event = await this.eventRepo.findById(eventId);

        if (!event) {
            logger.warn({ eventId}, "[EventService] Event not found");
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

    private async notifyEventApproved(event: Event, isApprove: boolean) {
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
