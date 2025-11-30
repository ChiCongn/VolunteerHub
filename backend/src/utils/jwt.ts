import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";
import crypto from "crypto";
import { UserRole } from "../domain/entities/enums";

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
    return jwt.sign(claims, JWT_SECRET, {
        ...COMMON_SIGN_OPTIONS,
        expiresIn: "15m", // ACCESS_TOKEN_EXPIRES_IN,
        jwtid: crypto.randomUUID(),
    });
};

export const signRefreshToken = (claims: RefreshTokenPayload): string => {
    return jwt.sign(claims, JWT_SECRET, {
        ...COMMON_SIGN_OPTIONS,
        expiresIn: "7d", // REFRESH_TOKEN_EXPIRES_IN,
    });
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    } catch (err) {
        throw new Error("Invalid or expired access token");
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (err) {
        throw new Error("Invalid or expired refresh token");
    }
};
