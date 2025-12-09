import { beforeAll, vi, it, expect } from "vitest";
import * as jwtUtils from "../../../utils/jwt";
import { describe } from "node:test";
import { app } from "../../../server";
import request from "supertest";
import { InvalidCredentialsError } from "../../../domain/errors/auth.error";
import { User } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/entities/enums";

vi.spyOn(jwtUtils, "verifyAccessToken").mockReturnValue({
    sub: "user-id",
    email: "a@b.com",
    role: "volunteer",
});

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

vi.mock("../../application/service/auth.service", () => {
    return {
        authService: {
            login: vi.fn().mockImplementation(({ email, password }) => {
                if (email === "a@b.com" && password === "123456") {
                    return { accessToken: "fake-token", refreshToken: "fake-refresh-token" };
                } else {
                    throw new InvalidCredentialsError();
                }
            }),
            register: vi.fn().mockImplementation(({ username, email, passwordHash }) => {
                return {
                    volunteer: mockVolunteer,
                    accessToken: "fake-token",
                    refreshToken: "fake-refresh-token",
                };
            }),
            refresh: vi.fn().mockResolvedValue({
                accessToken: "new-fake-token",
            }),
            logout: vi.fn().mockResolvedValue(undefined),
        },
    };
});

const loginEndpoint = "/api/v1/auth/login";
describe("POST /login", () => {
    it("should return 200 and token when credential are correct", async () => {
        const res = await request(app)
            .post(loginEndpoint)
            .send({ email: "a@b.com", password: "123456" });

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBe("fake-token");
    });

    it("should return 400 Invalid creadential when email or password is wrong", async () => {
        const res = await request(app)
            .post(loginEndpoint)
            .send({ email: "a@b.com", password: "abc123" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid creadential");
    });

    it("should return 400 Validation failed when password is empty", async () => {
        const res = await request(app).post(loginEndpoint).send({ email: "a@b.com", password: "" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Bad Request");
        expect(res.body.errors).toEqual(
            expect.arrayContaining([expect.objectContaining({ path: "password" })])
        );
    });

    it("should return 400 validation failed when email is invalid", async () => {
        const res = await request(app)
            .post(loginEndpoint)
            .send({ email: "invalid email", password: "heheh" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Bad Request");
        expect(res.body.errors).toEqual(
            expect.arrayContaining([expect.objectContaining({ path: "email" })])
        );
    });
});

const registerEndpoint = "/api/v1/auth/register";
describe("POST /register", () => {
    it("should return 201 and new volunteer + access and refresh token", async () => {
        const res = await request(app)
            .post(registerEndpoint)
            .send({ username: "example", email: "example@gmail.com", password: "Asbdvh@13245ndj" });

        expect(res.status).toBe(201);
        expect(res.body.accessToken).toBe("fake-token");
        expect(res.body.refreshToken).toBe("fake-refresh-token");
    });

    it("should return 400 if invalid input", async () => {
        const res = await request(app)
            .post(registerEndpoint)
            .send({ username: "", email: "example@gmail.com", password: "Asbdvh@13245ndj" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Bad Request");
    });

    it("should return 400 if weak password", async () => {
        const res = await request(app)
            .post(registerEndpoint)
            .send({ username: "heheh", email: "example@gmail.com", password: "13245ndj" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Bad Request");
    });
});
