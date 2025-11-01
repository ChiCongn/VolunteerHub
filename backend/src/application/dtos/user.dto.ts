import { UserRole, UserStatus } from "./enums";

export interface CreateVolunteerDto {
    username: string;
    email: string;
    passwordHash: string;
}

export interface UpdateUserDto {
    username?: string;
    passwordHash?: string;
    avatarUrl?: string;
}

export interface ListUserFilterDto {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
}
