import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../../../application/services/auth.service";
import { RefreshTokenRepository } from "../../../infrastructure/repositories/refresh-token.repository";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { CreateVolunteerDto, Credentials } from "../../../application/dtos/user.dto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../utils/jwt";
import {
    AccountLockedError,
    EmailAlreadyExistsError,
    LoginFailedError,
    RefreshTokenRevokedError,
} from "../../../domain/errors/auth.error";
import { mock } from "node:test";
import { User } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/entities/enums";

// mock dependencies
let authService: AuthService;
let mockUserRepo: Partial<UserRepository>;
let mockRefreshRepo: Partial<RefreshTokenRepository>;

beforeEach(() => {
    mockUserRepo = {
        create: vi.fn(),
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

describe("AuthService.register", () => {
    const mockData: CreateVolunteerDto = {
        username: "example",
        email: "example@gmail.com",
        passwordHash: "hehehehe",
    };
    it("should return volunteer, access token and refresh token", async () => {
        const mockVolunteer = new User({
            id: "vol-1",
            username: "example",
            email: "example@gmail.com",
            passwordHash: "hehehehe",
            avatarUrl: "", // or leave undefined to use default
            role: UserRole.Volunteer,
            status: UserStatus.Active,
            notificationIds: [],
            postIds: [],
            participatedEventIds: [],
            registeredEventIds: [],
            lastLogin: null,
            updatedAt: new Date(),
        });

        (mockUserRepo.create as any).mockResolvedValue(mockVolunteer);
        (signAccessToken as any).mockReturnValue("ACCESS_TOKEN");
        (signRefreshToken as any).mockReturnValue("REFRESH_TOKEN");

        const result = await authService.register(mockData);

        expect(result.volunteer).toBe(mockVolunteer);
        expect(result.accessToken).toBe("ACCESS_TOKEN");
        expect(result.refreshToken).toBe("REFRESH_TOKEN");

        // Ensure repositories were called correctly
        expect(mockUserRepo.create).toHaveBeenCalledWith(mockData);
        expect(mockRefreshRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: mockVolunteer.id,
                token: "REFRESH_TOKEN",
            })
        );
    });

    it("should throw email already existed error", async () => {
        (mockUserRepo.create as any).mockRejectedValue(new EmailAlreadyExistsError(mockData.email));
        await expect(authService.register(mockData)).rejects.toThrow(EmailAlreadyExistsError);
        expect(mockUserRepo.create).toHaveBeenCalledWith(mockData);
    });
});

describe("AuthService.login", () => {
    it("should return access and refresh tokens for valid credentials", async () => {
        const credentials: Credentials = { email: "test@example.com", password: "password" };

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
            password: credentials.password,
        });

        expect(tokens.accessToken).toBe("ACCESS_TOKEN");
        expect(tokens.refreshToken).toBe("REFRESH_TOKEN");
    });

    it("should propagate AccountLockedError", async () => {
        (mockUserRepo.findAuthUserByCredentials as any).mockImplementation(() => {
            throw new AccountLockedError();
        });
        await expect(authService.login({ email: "x", password: "x" })).rejects.toThrow(
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
