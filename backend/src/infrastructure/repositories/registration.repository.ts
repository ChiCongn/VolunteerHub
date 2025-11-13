import { PrismaClient, registrations } from "../prisma/generated/client";
import logger from "../../logger";
import {
    AlreadyRegisteredError,
    RegistrationNotFoundError,
    RegistrationClosedError
} from "../../domain/errors/registration.error";

export class RegistrationRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async register(userId: string, eventId: string): Promise<registrations> {
        logger.debug(`Registering user=${userId} for event=${eventId}`);
        if (await this.checkExistsByUserAndEvent(userId, eventId)) {
            throw new AlreadyRegisteredError(eventId, userId);
        }
        return this.prisma.registrations.create({
            data: { user_id: userId, event_id: eventId },
        });
    }

    async unregister(userId: string, eventId: string): Promise<void> {
        logger.debug(`Unregistering user=${userId} from event=${eventId}`);
        if (await !this.checkExistsByUserAndEvent(userId, eventId)) {
            throw new RegistrationNotFoundError('');
        }
        await this.prisma.registrations.delete({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId
                }
            }
        });
    }

    async unregisterById(id: string): Promise<void> {
        logger.debug(`Unregistering registration id=${id}`);
        if (await !this.checkExistsById(id)) {
            throw new RegistrationNotFoundError(id);
        }
        await this.prisma.registrations.delete({ where: { id } });
    }

    async checkExistsByUserAndEvent(userId: string, eventId: string): Promise<boolean> {
        const exists = await this.prisma.registrations.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId
                }
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