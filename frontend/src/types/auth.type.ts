export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user?: {
        id: string;
        username: string;
        email: string;
    };
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}
