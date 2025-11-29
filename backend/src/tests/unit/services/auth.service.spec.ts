import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../../../application/service/auth.service";
import { RefreshTokenRepository } from "../../../infrastructure/repositories/refresh-token.repository";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { Credentials } from "../../../application/dtos/user.dto";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../../utils/jwt";
import {
    AccountLockedError,
    LoginFailedError,
    RefreshTokenRevokedError,
} from "../../../domain/errors/auth.error";

// mock dependencies
let authService: AuthService;
let mockUserRepo: Partial<UserRepository>;
let mockRefreshRepo: Partial<RefreshTokenRepository>;

beforeEach(() => {
    mockUserRepo = {
        findAuthUserByCredentials: vi.fn(),
    };
    mockRefreshRepo = {
        create: vi.fn(),
        findByToken: vi.fn(),
        revoke: vi.fn(),
    };
    authService = new AuthService(
        mockRefreshRepo as RefreshTokenRepository,
        mockUserRepo as UserRepository
    );
    vi.mock("../../../utils/jwt", () => ({
        signAccessToken: vi.fn(),
        signRefreshToken: vi.fn(),
        verifyRefreshToken: vi.fn(),
    }));
});

describe("AuthService.login", () => {
    it("should return access and refresh tokens for valid credentials", async () => {
        const credentials: Credentials = { email: "test@example.com", passwordHash: "password" };

        const fakeUser = {
            id: "user-id",
            email: credentials.email,
            role: "volunteer",
        };

        // Mock repository to return a user
        (mockUserRepo.findAuthUserByCredentials as any).mockResolvedValue(fakeUser);

        // Spy on JWT functions to avoid real signing
        (signAccessToken as any).mockReturnValue("ACCESS_TOKEN");
        (signRefreshToken as any).mockReturnValue("REFRESH_TOKEN");

        const tokens = await authService.login({
            email: credentials.email,
            passwordHash: credentials.passwordHash,
        });

        expect(tokens.accessToken).toBe("ACCESS_TOKEN");
        expect(tokens.refreshToken).toBe("REFRESH_TOKEN");
    });

    it("should throw LoginFailedError if repository returns null", async () => {
        (mockUserRepo.findAuthUserByCredentials as any).mockResolvedValue(null);
        await expect(authService.login({ email: "x", passwordHash: "x" })).rejects.toThrow(
            LoginFailedError
        );
    });

    it("should propagate AccountLockedError", async () => {
        (mockUserRepo.findAuthUserByCredentials as any).mockImplementation(() => {
            throw new AccountLockedError();
        });
        await expect(authService.login({ email: "x", passwordHash: "x" })).rejects.toThrow(
            AccountLockedError
        );
    });
});

describe("AuthService.refresh", () => {
    it("should issue a new access token for a valid refresh token", async () => {
        const fakePayload = { sub: "user-id", email: "a@b.com", role: "volunteer", jti: "jti" };

        (verifyRefreshToken as any).mockReturnValue(fakePayload);
        (mockRefreshRepo.findByToken as any).mockResolvedValue({ revoked: false });

        (signAccessToken as any).mockReturnValue("NEW_ACCESS");

        const result = await authService.refresh("FAKE_REFRESH");

        expect(result.accessToken).toBe("NEW_ACCESS");
    });

    it("should throw RefreshTokenRevokedError if token revoked", async () => {
        (verifyRefreshToken as any).mockReturnValue({
            sub: "user-id",
            email: "a@b.com",
            role: "volunteer",
            jti: "jti",
        });

        (mockRefreshRepo.findByToken as any).mockResolvedValue({ revoked: true });

        await expect(authService.refresh("FAKE")).rejects.toThrow(RefreshTokenRevokedError);
    });
});

describe("AuthService.logout", () => {
    it("should revoke refresh token", async () => {
        (verifyRefreshToken as any).mockReturnValue({
            jti: "jti",
        });
        await authService.logout("FAKE_TOKEN");
        expect(mockRefreshRepo.revoke).toHaveBeenCalledWith("FAKE_TOKEN");
    });
});
