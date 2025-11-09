import { UserRole, UserStatus } from "../../domain/entities/enums";

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

export interface PublicUserProfile {
    id: string;
    username: string;
    avatarUrl: string;
    role: UserRole;
}

export interface AdminUserView {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    status: UserStatus;
    role: UserRole;
    lastLogin: Date | null;
    createdAt: Date;
}

export interface Credentials {
    email: string;
    passwordHash: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    status: UserStatus;
}
