import type { UserRole, UserStatus } from "./enum";

export interface UserProfile {
    id: string;
    username: string;
    email?: string;
    avatarUrl: string;

    role: UserRole;
    status: UserStatus;

    lastLogin?: Date | null;
    updatedAt?: Date;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    avatarUrl: string;

    role: UserRole;
    status: UserStatus;

    notifications: string[];

    lastLogin?: Date | null;
    updatedAt?: Date;
}

export interface ListUserFilterDto {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
}