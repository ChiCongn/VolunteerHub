import { UserRole, UserStatus } from "../entities/enums";

export interface CreateUserProps {
    id: string;

    name: string;
    email: string;
    passwordHash: string;
    avatarUrl: string | null;

    role: UserRole;
    status: UserStatus;

    notificationIds: string[];
    participatedEventIds: string[];
    registeredEventIds: string[];
    postIds: string[];

    lastLogin: Date | null;
    updatedAt: Date | null;
}

export interface UpdateUserProps {
    name?: string;
    passwordHash?: string;
    avatarUrl?: string;
}
