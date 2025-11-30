import { CreateRefreshTokenDto } from "../../application/dtos/refresh-token/create-refresh-token.dto";
import { PrismaClient } from "../prisma/generated/client";

export class RefreshTokenRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateRefreshTokenDto) {
        return this.prisma.refresh_tokens.create({
            data: {
                user_id: data.userId,
                token: data.token,
                expires_at: data.expiresAt,
            },
            select: { id: true, token: true },
        });
    }

    async findByToken(token: string) {
        return this.prisma.refresh_tokens.findUnique({ where: { token } });
    }

    async revoke(token: string) {
        return this.prisma.refresh_tokens.update({ where: { token }, data: { revoked: true } });
    }
}
