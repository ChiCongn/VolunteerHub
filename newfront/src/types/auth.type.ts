import type { UserRole, UserStatus } from "./enum";

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
        avatarUrl: string;

        role: UserRole;
        status: UserStatus;

        notifications: string[];

        lastLogin?: Date | null;
        updatedAt?: Date;
    };
}
