import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { RefreshTokenRepository } from "../../infrastructure/repositories/refresh-token.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { Credentials } from "../dtos/user.dto";
import {
    AccountLockedError,
    AccountPendingError,
    InvalidRefreshTokenError,
    LoginFailedError,
    RefreshTokenRevokedError,
} from "../../domain/errors/auth.error";
import { UserNotFoundError } from "../../domain/errors/user.error";
import { hashPassword } from "../../utils/hash";
import { JsonWebTokenError } from "jsonwebtoken";

export class AuthService {
    constructor(
        private readonly refreshRepo: RefreshTokenRepository,
        private readonly userRepo: UserRepository
    ) {}

    async login(credential: Credentials) {
        try {
            // stupid name variable, it must be password because dont want to create new dto :(
            credential.passwordHash = await hashPassword(credential.passwordHash);
            const authUser = await this.userRepo.findAuthUserByCredentials(credential);

            if (!authUser) {
                throw new UserNotFoundError(credential.email);
            }

            const accessToken = signAccessToken({
                iss: "https://volunteerhub.com",
                sub: authUser.id,
                email: authUser.email,
                role: authUser.role,
            });

            const refreshToken = signRefreshToken({
                sub: authUser.id,
                email: authUser.email,
            });

            // default expires after 7 day, can change it (will replcae by .env)
            const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

            // store refresh token
            await this.refreshRepo.create({
                userId: authUser.id,
                token: refreshToken,
                expiresAt,
            });

            return { accessToken, refreshToken };
        } catch (err) {
            if (err instanceof AccountLockedError) {
                throw err;
            }
            if (err instanceof AccountPendingError) {
                throw err;
            }
            throw new LoginFailedError();
        }
    }

    async refresh(token: string) {
        try {
            const payload = verifyRefreshToken(token);
            const stored = await this.refreshRepo.findByToken(token);

            if (!stored || stored.revoked) {
                throw new RefreshTokenRevokedError();
            }

            const newAT = signAccessToken({
                iss: "https://volunteerhub.com",
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            });

            return { accessToken: newAT };
        } catch (err) {
            if (err instanceof JsonWebTokenError) {
                throw new InvalidRefreshTokenError();
            }
            throw err;
        }
    }

    async logout(token: string) {
        try {
            verifyRefreshToken(token);
            await this.refreshRepo.revoke(token);
        } catch (err) {
            if (err instanceof JsonWebTokenError) {
                throw new InvalidRefreshTokenError();
            }
            throw err;
        }
    }
}
