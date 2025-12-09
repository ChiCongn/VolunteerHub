import { RegistrationStatus } from "../../../domain/entities/enums";

export interface RegistrationFilterDto {
    eventId?: string;
    userId?: string;
    status?: RegistrationStatus;
}
