import { CreateRefreshTokenDto } from "../../application/dtos/refresh-token/create-refresh-token.dto";
import { PrismaClient } from "../prisma/generated/client";

export class RefreshTokenRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateRefreshTokenDto) {
        return this.prisma.refresh_token.create({
            data: {
                user_id: data.userId,
                token: data.token,
                expires_at: data.expiresAt,
            },
            select: { id: true, token: true },
        });
    }

    async findByToken(token: string) {
        return this.prisma.refresh_token.findUnique({ where: { token } });
    }

    async revoke(token: string) {
        return this.prisma.refresh_token.update({ where: { token }, data: { revoked: true } });
    }
}
