import { DomainError } from "./domain.error";

export class RegistrationNotFoundError extends DomainError {
    constructor(regId: string) {
        super("REGISTRATION_NOT_FOUND", `Registration ${regId} not found`, [regId]);
    }
}

export class AlreadyRegisteredError extends DomainError {
    constructor(eventId: string, userId: string) {
        super("ALREADY_REGISTERED", `User ${userId} already registered for event ${eventId}`, [
            userId,
            eventId,
        ]);
    }
}

export class RegistrationClosedError extends DomainError {
    constructor(eventId: string) {
        super("REGISTRATION_CLOSED", `Registration for event ${eventId} is closed`, [eventId]);
    }
}

export class CannotWithdrawAfterStartError extends DomainError {
    constructor(eventId: string) {
        super("CANNOT_WITHDRAW", `Cannot withdraw from event ${eventId} after it started`, [
            eventId,
        ]);
    }
}
