import { RegistrationStatus } from "../../domain/entities/enums";

export interface CreateRegistrationDto {
    userId: string;
    eventId: string;
    formData?: Record<string, any>;
}

export interface RejectRegistrationDto {
    regId: string;
    reason?: string;
}

export interface RegistrationFilterDto {
    eventId?: string;
    userId?: string;
    status?: RegistrationStatus;
}
