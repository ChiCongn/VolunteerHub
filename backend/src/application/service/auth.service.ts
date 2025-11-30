import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { RefreshTokenRepository } from "../../infrastructure/repositories/refresh-token.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { CreateVolunteerDto, Credentials } from "../dtos/user.dto";
import {
    AccountLockedError,
    AccountPendingError,
    InvalidRefreshTokenError,
    LoginFailedError,
    RefreshTokenRevokedError,
} from "../../domain/errors/auth.error";
import { UserNotFoundError } from "../../domain/errors/user.error";
import { hashPassword } from "../../utils/hash";
//import { JsonWebTokenError } from "jsonwebtoken";
import { UserStatus } from "../../domain/entities/enums";
import { refreshRepo, userRepo } from "../../infrastructure/repositories";
import logger from "../../logger";

export class AuthService {
    constructor(
        private readonly refreshRepo: RefreshTokenRepository,
        private readonly userRepo: UserRepository
    ) {}

    async register(data: CreateVolunteerDto) {
        const volunteer = await this.userRepo.create(data);
        const accessToken = signAccessToken({
            sub: volunteer.id,
            email: volunteer.email,
            role: volunteer.role,
        });

        const refreshToken = signRefreshToken({
            sub: volunteer.id,
            email: volunteer.email,
            role: volunteer.role,
        });

        // default expires after 7 day, can change it (will replcae by .env)
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

        // store refresh token
        await this.refreshRepo.create({
            userId: volunteer.id,
            token: refreshToken,
            expiresAt,
        });

        return { volunteer, accessToken, refreshToken };
    }

    async login(credential: Credentials) {
        const user = await this.userRepo.findAuthUserByCredentials(credential);

        if (!user) {
            throw new UserNotFoundError(credential.email);
        }

        if (user.status === UserStatus.Locked) {
            throw new AccountLockedError();
        }

        if (user.status === UserStatus.Pending) {
            throw new AccountPendingError();
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
            // if (err instanceof JsonWebTokenError) {
            //     throw new InvalidRefreshTokenError();
            // }
            throw err;
        }
    }
}

console.log("export authService");
export const authService = new AuthService(refreshRepo, userRepo);
