export interface RefreshTokenDto {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
}
