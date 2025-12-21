import { UserRole, UserStatus } from "../entities/enums";

export interface CreateUserProps {
    id: string;

    username: string;
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
    username?: string;
    passwordHash?: string;
    avatarUrl?: string;
}
