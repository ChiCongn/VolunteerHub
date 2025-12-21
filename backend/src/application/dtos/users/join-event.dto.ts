import { EventStatus, RegistrationStatus } from "../../../domain/entities/enums";

export interface UserJoinedEvent {
    registrationId: string;
    eventId: string;
    eventName: string;
    eventStatus: EventStatus;
    imageUrl: string;
    startTime: Date;
    registrationStatus: RegistrationStatus;
}