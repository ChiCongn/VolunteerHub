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
        lastLogin: Date;
        role: UserRole;
        status: UserStatus;
    };
}
