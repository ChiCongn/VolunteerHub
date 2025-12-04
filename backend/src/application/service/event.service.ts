import { RegistrationStatus } from "../../domain/entities/enums";
import { IEventRepository } from "../../domain/repositories/event.irepository";
import { eventRepo } from "../../infrastructure/repositories";
import logger from "../../logger";

export class EventService {
    constructor(private readonly eventRepo: IEventRepository) {}

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
}

export const eventService = new EventService(eventRepo);
