import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { CreateVolunteerDto, Credentials } from "../dtos/user.dto";
import {
    RefreshTokenRevokedError,
} from "../../domain/errors/auth.error";
import { UserNotFoundError } from "../../domain/errors/user.error";
import { refreshRepo, userRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { IUserRepository } from "../../domain/repositories/user.irepositoty";
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.irepository";

export class AuthService {
    constructor(
        private readonly refreshRepo: IRefreshTokenRepository,
        private readonly userRepo: IUserRepository
    ) {}

    async register(data: CreateVolunteerDto) {
        const user = await this.userRepo.create(data);
        const accessToken = signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = signRefreshToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        // default expires after 7 day, can change it (will replcae by .env)
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

        // store refresh token
        await this.refreshRepo.create({
            userId: user.id,
            token: refreshToken,
            expiresAt,
        });

        return { user, accessToken, refreshToken };
    }

    async login(credential: Credentials) {
        const user = await this.userRepo.findAuthUserByCredentials(credential);

        // redundant because it's handled in repo but typescript requires :(
        if (!user) {
            throw new UserNotFoundError(credential.email);
        }

        const accessToken = signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = signRefreshToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        // default expires after 7 day, can change it (will replcae by .env)
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

        // store refresh token
        await this.refreshRepo.create({
            userId: user.id,
            token: refreshToken,
            expiresAt,
        });

        return { accessToken, refreshToken };
    }

    async refresh(token: string) {
        logger.debug({ token, action: "refresh" }, "[AuthService] Refresh token request");
        const payload = verifyRefreshToken(token);
        const stored = await this.refreshRepo.findByToken(token);

        if (!stored || stored.revoked) {
            logger.warn(
                { token, action: "refresh" },
                "[AuthService] Refresh token revoked or not found"
            );
            throw new RefreshTokenRevokedError();
        }

        const newAT = signAccessToken({
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
        });

        return { accessToken: newAT };
    }

    async logout(token: string) {
        try {
            verifyRefreshToken(token);
            await this.refreshRepo.revoke(token);
        } catch (err) {
            throw err;
        }
    }
}

export const authService = new AuthService(refreshRepo, userRepo);
