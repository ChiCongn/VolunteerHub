export interface CreateRefreshTokenDto {
    userId: string;
    token: string;
    expiresAt: Date;
}
