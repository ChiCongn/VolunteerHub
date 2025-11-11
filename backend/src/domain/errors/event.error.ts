import { DomainError } from "./domain.error";
import { EventStatus } from "../entities/enums";

export class EventNotFoundError extends DomainError {
    constructor(eventId: string) {
        super("EVENT_NOT_FOUND", `Event with ID ${eventId} not found`, [eventId]);
    }
}

export class EventAlreadyApprovedError extends DomainError {
    constructor(eventId: string) {
        super("EVENT_ALREADY_APPROVED", `Event ${eventId} is already approved`, [eventId]);
    }
}

export class EventCannotBeCancelledError extends DomainError {
    constructor(eventId: string, status: EventStatus) {
        super("EVENT_CANNOT_CANCEL", `Event ${eventId} in status ${status} cannot be cancelled`, [
            eventId,
            status,
        ]);
    }
}

export class EventCapacityExceededError extends DomainError {
    constructor(eventId: string, capacity: number) {
        super("EVENT_FULL", `Event ${eventId} is at full capacity (${capacity})`, [
            eventId,
            capacity.toString(),
        ]);
    }
}

export class EventTimeInvalidError extends DomainError {
    constructor() {
        super("EVENT_TIME_INVALID", "End time must be after start time");
    }
}

export class EventCapacityInvalidError extends DomainError {
    constructor() {
        super("EVENT_CAPACITY_INVALID", "Capacity must be greater than 0");
    }
}

export class NotEventOwnerError extends DomainError {
    constructor(eventId: string, userId: string) {
        super("NOT_EVENT_OWNER", `User ${userId} is not owner of event ${eventId}`, [
            userId,
            eventId,
        ]);
    }
}

export class EventAlreadyHasFormError extends DomainError {
    constructor(eventId: string) {
        super("EVENT_FORM_EXISTS", `Event ${eventId} already has a form`, [eventId]);
    }
}
