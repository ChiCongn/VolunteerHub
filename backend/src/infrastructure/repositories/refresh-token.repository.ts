import { CreateRefreshTokenDto } from "../../application/dtos/refresh-token/create-refresh-token.dto";
import { RefreshTokenDto } from "../../application/dtos/refresh-token/refresh-token.dto";
import { RefreshTokenNotFoundError } from "../../domain/errors/auth.error";
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.irepository";
import logger from "../../logger";
import { PrismaClient } from "../prisma/generated/client";

export class RefreshTokenRepository implements IRefreshTokenRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateRefreshTokenDto) {
        logger.debug(
            { userId: data.userId, action: "create" },
            "[RefreshTokenRepository] Creating refresh token"
        );
        return this.prisma.refresh_tokens.create({
            data: {
                user_id: data.userId,
                token: data.token,
                expires_at: data.expiresAt,
            },
            select: { id: true, token: true },
        });
    }

    async findByToken(token: string): Promise<RefreshTokenDto> {
        logger.debug(
            { token, action: "findByToken" },
            "[RefreshTokenRepository] Finding refresh token"
        );
        const tokenRecord = await this.prisma.refresh_tokens.findUnique({ where: { token } });

        if (!tokenRecord) {
            logger.warn(
                { token, action: "findByToken" },
                "[RefreshTokenRepository] Refresh token not found"
            );
            throw new RefreshTokenNotFoundError();
        }

        return {
            id: tokenRecord.id,
            userId: tokenRecord.user_id,
            token: tokenRecord.token,
            expiresAt: tokenRecord.expires_at,
            revoked: tokenRecord.revoked,
        };
    }

    async deleteToken(token: string): Promise<void> {
        logger.debug(
            { token, action: "deleteToken" },
            "[RefreshTokenRepository] Deleting refresh token"
        );

        await this.prisma.refresh_tokens.delete({
            where: { token },
        });
    }

    async revoke(token: string): Promise<void> {
        logger.debug(
            { token, action: "revoke" },
            "[RefreshTokenRepository] Revoking refresh token"
        );
        await this.prisma.refresh_tokens.update({ where: { token }, data: { revoked: true } });
    }
}
