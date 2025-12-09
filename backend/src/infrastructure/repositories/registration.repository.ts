import { PrismaClient, registrations } from "../prisma/generated/client";
import logger from "../../logger";
import { IRegistrationRepository } from "../../domain/repositories/registration.irepository";
import { Pagination } from "../../application/dtos/pagination.dto";
import { RegistrationFilterDto } from "../../application/dtos/registration.dto";
import { Registration } from "../../application/dtos/registration/registration.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";

export class RegistrationRepository implements IRegistrationRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async register(userId: string, eventId: string): Promise<string> {
        logger.debug(
            {
                userId: userId,
                eventId: eventId,
                action: "register event",
            },
            "[RegistrationRepository] Registering to enroll an event"
        );

        const registration = await this.prisma.registrations.create({
            data: {
                user_id: userId,
                event_id: eventId,
            },
            select: {
                id: true,
            },
        });

        return registration.id;
    }

    async withdrawRegistration(id: string): Promise<void> {
        logger.debug({
            registrationId: id,
            action: "unregister",
        });
        await this.prisma.registrations.delete({ where: { id } });
    }

    async listRegistration(
        filters: RegistrationFilterDto,
        pagination: Pagination,
        sortOption: SortOption
    ): Promise<Registration[]> {
        logger.info(
            { filters, pagination, sortOption },
            "[RegistrationRepository] listRegistrations – implementation pending"
        );
        // TODO: will implement later
        return [];
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

    async checkExists(id: string): Promise<boolean> {
        const exists = await this.prisma.registrations.findUnique({
            where: { id },
            select: { id: true },
        });
        return !!exists;
    }
}
