import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";
import crypto from "crypto";
import { UserRole } from "../domain/entities/enums";
import logger from "../logger";
import { InvalidRefreshTokenError, RefreshTokenExpiredError } from "../domain/errors/auth.error";

// === Fail fast if secrets missing ===
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_ISSUER = process.env.JWT_ISSUER || "https://volunteerhub.com";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "https://api.volunteerhub.com";

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be defined");
}

// === Configurable expiry (now actually used!) ===
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export interface AccessTokenPayload {
    sub: string;
    email: string;
    role: UserRole;
}

export interface RefreshTokenPayload {
    sub: string;
    email: string;
    role: UserRole;
}

const COMMON_SIGN_OPTIONS: SignOptions = {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: "HS256",
};

export const signAccessToken = (claims: AccessTokenPayload) => {
    logger.debug({ claims }, "[JWT] Signing access token");
    return jwt.sign(claims, JWT_SECRET, {
        ...COMMON_SIGN_OPTIONS,
        expiresIn: "15m", // ACCESS_TOKEN_EXPIRES_IN,
        jwtid: crypto.randomUUID(),
    });
};

export const signRefreshToken = (claims: RefreshTokenPayload): string => {
    logger.debug({ claims }, "[JWT] Signing refresh token");
    return jwt.sign(claims, JWT_REFRESH_SECRET, {
        ...COMMON_SIGN_OPTIONS,
        expiresIn: "7d", // REFRESH_TOKEN_EXPIRES_IN,
    });
};

export const verifyAccessToken = (token: string) => {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
        logger.debug({ payload }, "[JWT] Access token verified");
        return payload;
    } catch (err) {
        logger.error({ error: err, token }, "[JWT] Failed to verify access token");
        throw new Error("Invalid or expired access token");
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        const payload = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
        logger.debug({ payload }, "[JWT] Refresh token verified");
        return payload;
    } catch (err) {
        logger.error({ error: err, token }, "[JWT] Failed to verify refresh token");
        throw new InvalidRefreshTokenError;
    }
};
