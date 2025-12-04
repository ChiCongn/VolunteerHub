import { IEventRepository } from "../../domain/repositories/event.irepository";
import { eventRepo } from "../../infrastructure/repositories";
import logger from "../../logger";

export class EventService {
    constructor(private readonly eventRepo: IEventRepository) {}

    async findOwnerId(eventId: string) {
        logger.trace(
            { eventId, action: "findOwnerId" },
            "[EventService] Fetching owner id of this event"
        );
        return eventRepo.findOwner(eventId);
    }

    async findManagerIds(eventId: string) {
        logger.trace(
            { eventId, action: "findManagerIds" },
            "[EventService] Fetching manager ids of this event"
        );
        return eventRepo.findManagers(eventId);
    }    
}

export const eventService = new EventService(eventRepo);
