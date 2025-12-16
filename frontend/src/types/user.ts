import type { UserRole, UserStatus } from "./enum";

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;

    role: UserRole;
    status: UserStatus;

    notifications: string[];
    postIds: string[];
    participatedEventIds: string[];
    registeredEventIds: string[];

    lastLogin: Date | null;
    updatedAt: Date;
}
