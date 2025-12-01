import request from "supertest";
import { app } from "../../server";
import { describe, expect, it } from "vitest";
import { UserRole, UserStatus } from "../../domain/entities/enums";

const listUserEndpoint = "/api/v1/users";
describe("User API", () => {
    describe("list/filter users", async () => {
        it("should return list user", async () => {
            const res = await request(app)
                .get(listUserEndpoint)
                .query({ search: "user", limit: 2 });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.items)).toBe(true);
            expect(res.body.total).not.toBeNull();
            expect(res.body.items.length).toBeLessThanOrEqual(2);
        });

        it("should return list user", async ()=>{
            const res = await request(app)
                .get(listUserEndpoint)
                .query({ role: UserRole.Volunteer, limit: 10 });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.items)).toBe(true);
            expect(res.body.total).not.toBeNull();
            expect(res.body.items.length).toBeLessThanOrEqual(10);
        });

        it("should return list user", async ()=>{
            const res = await request(app)
                .get(listUserEndpoint)
                .query({ status: UserStatus.Active, limit: 10 });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.items)).toBe(true);
            expect(res.body.total).not.toBeNull();
            expect(res.body.items.length).toBeLessThanOrEqual(10);
        });

        it("should return 400 and Bad Request if invalid input", async ()=> {
            const res = await request(app)
                .get(listUserEndpoint)
                .query({ status: "root", limit: 2 });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Bad Request");
        });
    });

    // describe("fetch public profile", async ()=>{
    //     it("should return public profile", async()=>{

    //     });

    //     it("should return 404 and user not found error", async ()=>{

    //     });

    //     it("should return admin view", async ()=>{

    //     });

    //     it("should return 404 and user not found error for admin", async ()=>{

    //     });

    //     it("should return 400 Bad request", async () => {

    //     });
    // });
});
