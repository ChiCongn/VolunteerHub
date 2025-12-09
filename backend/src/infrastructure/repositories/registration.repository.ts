import { PrismaClient, registrations } from "../prisma/generated/client";
import logger from "../../logger";
import {
    AlreadyRegisteredError,
    RegistrationNotFoundError,
} from "../../domain/errors/registration.error";

export class RegistrationRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async register(userId: string, eventId: string): Promise<registrations> {
        logger.debug(
            {
                userId: userId,
                eventId: eventId,
                action: "register event",
            },
            "[RegistrationRepository] Registering to enroll an event"
        );

        if (await this.checkExistsByUserAndEvent(userId, eventId)) {
            logger.warn(
                {
                    userId: userId,
                    eventId: eventId,
                },
                "[RegistrationRepository] The user is already register this event"
            );

            throw new AlreadyRegisteredError(eventId, userId);
        }
        return this.prisma.registrations.create({
            data: { user_id: userId, event_id: eventId },
        });
    }

    async unregister(userId: string, eventId: string): Promise<void> {
        logger.debug(
            {
                userId: userId,
                eventId: eventId,
                action: "unregister event",
            },
            "[RegistrationRepository] Unregister from event"
        );

        if (await !this.checkExistsByUserAndEvent(userId, eventId)) {
            logger.debug(
                {
                    userId: userId,
                    eventId: eventId,
                },
                "[RegistrationRepository] The user is not registered this event"
            );

            throw new RegistrationNotFoundError("");
        }
        await this.prisma.registrations.delete({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId,
                },
            },
        });
    }

    async unregisterById(id: string): Promise<void> {
        logger.debug({
            registrationId: id,
            action: "unregister",
        });

        if (await !this.checkExistsById(id)) {
            logger.debug("[RegistrationRepository] The registration id is not found");
            throw new RegistrationNotFoundError(id);
        }
        await this.prisma.registrations.delete({ where: { id } });
    }

    async checkExistsByUserAndEvent(userId: string, eventId: string): Promise<boolean> {
        logger.debug(
            {
                userId: userId,
                eventId: eventId,
                action: "checkExistsByUserAndEvent",
            },
            "[RegistrationRepository] Checking the user is already register this event"
        );

        const exists = await this.prisma.registrations.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId,
                },
            },
            select: { id: true },
        });
        return !!exists;
    }

    async checkExistsById(id: string): Promise<boolean> {
        const exists = await this.prisma.registrations.findUnique({
            where: { id },
            select: { id: true },
        });
        return !!exists;
    }
}
