import request from "supertest";
import { app } from "../../server";
import { describe, expect, it } from "vitest";
import prisma from "../../infrastructure/prisma/client";

const registerEndpoint = "/api/v1/auth/register";
const loginEndpoint = "/api/v1/auth/login";
describe("Auth API", () => {
    describe("/register", () => {
        it("should register a new user", async () => {
            const res = await request(app).post(registerEndpoint).send({
                username: "user001",
                email: "user001@gmail.com",
                password: "Password@123",
            });

            expect(res.status).toBe(201);
            expect(res.body.accessToken).not.toBeNull();
            expect(res.body.refreshToken).not.toBeNull();

            const volunteer = await prisma.users.findUnique({
                where: { email: "user001@gmail.com" },
            });
            expect(volunteer).not.toBeNull();
        });

        it("should return bad request if invalid input", async () => {
            const res = await request(app).post(registerEndpoint).send({
                username: "",
                email: "invalid-email",
                password: "Password@123",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Bad Request");
            expect(res.body.errors).toEqual(
                expect.arrayContaining([expect.objectContaining({ path: "username" })])
            );
        });

        it("should return bad request if weak password", async () => {
            const res = await request(app).post(registerEndpoint).send({
                username: "user001",
                email: "user@gmail.com",
                password: "weakpass",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Bad Request");
            expect(res.body.errors).toEqual(
                expect.arrayContaining([expect.objectContaining({ path: "password" })])
            );
        });

        it("should throw error email existed", async () => {
            const res = await request(app).post(registerEndpoint).send({
                username: "user001",
                email: "user001@gmail.com",
                password: "Password@123",
            });

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Email user001@gmail.com already exists");
        });
    });

    describe("/login", () => {
        it("should login success", async () => {
            const res = await request(app)
                .post(loginEndpoint)
                .send({ email: "user001@gmail.com", password: "Password@123" });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).not.toBeNull();
            expect(res.body.refreshToken).not.toBeNull();
        });

        it("should return 400 and Invalid creadential", async () => {
            const res = await request(app)
                .post(loginEndpoint)
                .send({ email: "user001@gmail.com", password: "abc123" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid creadential");
        });

        it("should return 400 Bad Request when password is empty", async () => {
            const res = await request(app)
                .post(loginEndpoint)
                .send({ email: "a@b.com", password: "" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Bad Request");
            expect(res.body.errors).toEqual(
                expect.arrayContaining([expect.objectContaining({ path: "password" })])
            );
        });

        it("should return 403 and Account is locked", async () => {
            const res = await request(app)
                .post(loginEndpoint)
                .send({ email: "locked@gmail.com", password: "Example@123" });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Account is locked");
        });
    });

    // describe("/refresh", () => {
    //     it("should return access token", async()=>{

    //     })
    // });
});
