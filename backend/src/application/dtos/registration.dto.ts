import { RegistrationStatus } from "../../domain/entities/enums";
import { PublicUserProfile } from "./user.dto";

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
    eventId: string;
    username?: string;
    status?: RegistrationStatus;
}

export interface Registration {
    regId: string;
    user: PublicUserProfile;
    status: RegistrationStatus;
    createdAt: Date;
}

export interface RegistrationEntity {
    id: string;
    userId: string;
    eventId: string;
    status: RegistrationStatus;
    createdAt: Date;
}
