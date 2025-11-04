import { UserRole, UserStatus } from "../../application/dtos/enums";

export interface CreateUserProps {
    id: string;

    name: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;

    role: UserRole;
    status: UserStatus;

    notificationIds: string[];
    participatedEventIds: string[];
    registeredEventIds: string[];
    postIds: string[];
    commentIds: string[];
    reactionIds: string[];

    lastLogin?: Date | null;
    updatedAt?: Date;
}

export interface UpdateUserProps {
    name?: string;
    passwordHash?: string;
    avatarUrl?: string;
}
