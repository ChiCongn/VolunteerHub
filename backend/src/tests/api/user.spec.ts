import request from "supertest";
import { app } from "../../server";
import { describe, expect, it } from "vitest";
import { UserRole, UserStatus } from "../../domain/entities/enums";
import prisma from "../../infrastructure/prisma/client";

const listUserEndpoint = "/api/v1/users";
const fetchUserEndpoint = "/api/v1/users";
const getCurrentUserProfile = "/api/v1/users/me";
// replace by real id
const existedUserId = "9eb27424-3339-4524-8134-e4993169179d";
const unexistedUserId = "00000000-0000-0000-0000-000000000000";
const mockRootAdminId = "76358a06-dd79-49e4-bd67-7403cdcbc25e";
// replace by valid access token
const rootAdminToken =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzBhZjE3Mi1mZDY4LTQ4MGItODk1YS03MmI4MDFjY2IyYjMiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NDY0NDk1NiwiZXhwIjoxNzY0NjQ1ODU2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIiwianRpIjoiYmE0M2Q2MzMtMDZlNC00M2VjLWIyZDgtZmM2ZTRjZWEzNzYxIn0.2GnYw9OSXolbJVMWkYQTj7Btt9K_Ysy7tpFDW5d_Wo8";
const adminToken =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNzBhZjE3Mi1mZDY4LTQ4MGItODk1YS03MmI4MDFjY2IyYjMiLCJlbWFpbCI6InRoZXJlc2lhQHZvbHVudGVlcmh1Yi5jb20iLCJyb2xlIjoiZXZlbnRfbWFuYWdlciIsImlhdCI6MTc2NDY0NDk1NiwiZXhwIjoxNzY0NjQ1ODU2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIiwianRpIjoiYmE0M2Q2MzMtMDZlNC00M2VjLWIyZDgtZmM2ZTRjZWEzNzYxIn0.2GnYw9OSXolbJVMWkYQTj7Btt9K_Ysy7tpFDW5d_Wo8";
const userToken =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNjkxMmI3My0yNDM3LTQwMTEtYjMzYi0zMWFjMmI4YWU5ZTciLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NDY1NzQ3NiwiZXhwIjoxNzY0NjU4Mzc2LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIiwianRpIjoiMWQxYWM3MzAtZmQ3My00MDg1LWE4M2ItYzQ0Mzk5ZDY5NzVmIn0.5O9tUzvWW-7KeRUOHdO0hhlABZslIDRKZW4e5Hhv8qA";

const anotherUserToken =
    "Bearer eyJhbGciEiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNjkxMmI3My0yNDM3LTQwMTEtYjMzYi0zMWFjMmI4YWU5ZTciLCJlbWFpbCI6InVzZXIwMDFAZ21haWwuY29tIiwicm9sZSI6InZvbHVudGVlciIsImlhdCI6MTc2NDYwMDEzOSwiZXhwIjoxNzY0NjAxMDM5LCJhdWQiOiJodHRwczovL2FwaS52b2x1bnRlZXJodWIuY29tIiwiaXNzIjoiaHR0cHM6Ly92b2x1bnRlZXJodWIuY29tIiwianRpIjoiNmY5Mjg4MjktNDA4OS00NjkyLWFhOGQtMmQ1MzliOGU2ZTdkIn0.aNMvwlFASWkRm83LCimWUoRu1f9SYnB-HVz0kArMZJQ";

describe("User API", () => {
    // describe("list/filter users", async () => {
    //     it("should return list user", async () => {
    //         const res = await request(app)
    //             .get(listUserEndpoint)
    //             .query({ search: "user", limit: 2 });

    //         expect(res.status).toBe(200);
    //         expect(Array.isArray(res.body.items)).toBe(true);
    //         expect(res.body.total).not.toBeNull();
    //         expect(res.body.items.length).toBeLessThanOrEqual(2);
    //     });

    //     it("should return list user", async () => {
    //         const res = await request(app)
    //             .get(listUserEndpoint)
    //             .query({ role: UserRole.Volunteer, limit: 10 });

    //         expect(res.status).toBe(200);
    //         expect(Array.isArray(res.body.items)).toBe(true);
    //         expect(res.body.total).not.toBeNull();
    //         expect(res.body.items.length).toBeLessThanOrEqual(10);
    //     });

    //     it("should return list user", async () => {
    //         const res = await request(app)
    //             .get(listUserEndpoint)
    //             .query({ status: UserStatus.Active, limit: 10 });

    //         expect(res.status).toBe(200);
    //         expect(Array.isArray(res.body.items)).toBe(true);
    //         expect(res.body.total).not.toBeNull();
    //         expect(res.body.items.length).toBeLessThanOrEqual(10);
    //     });

    //     it("should return 400 and Bad Request if invalid input", async () => {
    //         const res = await request(app)
    //             .get(listUserEndpoint)
    //             .query({ status: "root", limit: 2 });

    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe("Bad Request");
    //     });
    // });

    // describe("fetch public profile", async () => {
    //     it("should return public profile", async () => {
    //         const res = await request(app)
    //             .get(`/api/v1/users/${existedUserId}`)
    //             .set("Authorization", userToken);

    //         expect(res.status).toBe(200);
    //         expect(res.body.username).not.toBeNull();
    //         expect(res.body.id).toBe(existedUserId);
    //         expect(res.body.status).toBeUndefined();
    //     });

    //     it("should return 404 and user not found error", async () => {
    //         const res = await request(app)
    //             .get(`/api/v1/users/${unexistedUserId}`)
    //             .set("Authorization", userToken);

    //         expect(res.status).toBe(404);
    //         expect(res.body.message).toBe("User not found");
    //     });

    //     it("should return admin view", async () => {
    //         const res = await request(app)
    //             .get(`/api/v1/users/${existedUserId}`)
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(200);
    //         expect(res.body.username).not.toBeNull();
    //         expect(res.body.status).not.toBeNull();
    //         expect(res.body.createdAt).not.toBeNull();
    //         expect(res.body.id).toBe(existedUserId);
    //     });

    //     it("should return 404 and user not found error for admin", async () => {
    //         const res = await request(app)
    //             .get(`/api/v1/users/${unexistedUserId}`)
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(404);
    //         expect(res.body.message).toBe("User not found");
    //     });

    //     it("should return 400 Bad request", async () => {
    //         const res = await request(app)
    //             .get(`/api/v1/users/hehehe`)
    //             .set("Authorization", userToken);

    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe("Bad Request");
    //     });
    // });

    // describe("lock/unlock volunteer", async () => {
    //     it("should return 204 and lock the user", async () => {
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${existedUserId}/lock`)
    //             .send({ locked: true })
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(204);
    //         const volunteer = await prisma.users.findUnique({
    //             where: { id: existedUserId },
    //         });
    //         expect(volunteer?.status).toBe(UserStatus.Locked);
    //     });

    //     it("should return 204 and unlock the user", async () => {
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${existedUserId}/lock`)
    //             .send({ locked: false })
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(204);
    //         const volunteer = await prisma.users.findUnique({
    //             where: { id: existedUserId },
    //         });
    //         expect(volunteer?.status).toBe(UserStatus.Active);
    //     });

    //     it("should return 404 if user not found", async () => {
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${unexistedUserId}/lock`)
    //             .send({ locked: true })
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(404);
    //         expect(res.body.message).toBe("User not found");
    //     });

    //     it("should return 403 if trying to lock root admin", async () => {
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${mockRootAdminId}/lock`)
    //             .send({ locked: true })
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(403);
    //         expect(res.body.message).toBe("Cannot lock root admin");
    //     });

    //     it("should return 400 for invalid user ID", async () => {
    //         const invalidId = "not-a-uuid";
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${invalidId}/lock`)
    //             .send({ locked: true })
    //             .set("Authorization", adminToken);

    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe("Bad Request");
    //     });

    //     it("should return 401 Unauthorized if no token is provided", async () => {
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${existedUserId}/lock`)
    //             .send({ locked: true });

    //         expect(res.status).toBe(401);
    //         expect(res.body.message).toBe("Missing or invalid Authorization header");
    //     });

    //     it("should return 401 Unauthorized if token is invalid", async () => {
    //         const res = await request(app)
    //             .patch(`/api/v1/users/${existedUserId}/lock`)
    //             .send({ locked: true })
    //             .set("Authorization", "Bearer invalidtoken");

    //         expect(res.status).toBe(401);
    //         expect(res.body.message).toBe("Unauthorized: Invalid or expired token");
    //     });

    //     it("should return 403 Forbidden if non-admin user tries to lock a user", async () => {
    //         // TODO: implement locked user access restriction later
    //     });
    // });

    // describe("GET /me - current user profile", async () => {
    //     it("should return 200 and user profile", async () => {
    //         const res = await request(app)
    //             .get(getCurrentUserProfile)
    //             .set("Authorization", userToken);

    //         expect(res.status).toBe(200);
    //         //console.log(res.body);
    //         // TODO: Replace _-prefixed fields with proper private fields in domain model
    //         expect(res.body._email).toBeDefined();
    //         expect(res.body.id).toBeDefined();
    //     });

    //     it("should return 404 if user not found", async () => {
    //         const res = await request(app)
    //             .get(getCurrentUserProfile)
    //             .set("Authorization", anotherUserToken);

    //         expect(res.status).toBe(404);
    //         expect(res.body.message).toBe("User not found");
    //     });

    //     it("should return 401 Unauthorized if token is invalid", async () => {
    //         const res = await request(app)
    //             .get(getCurrentUserProfile)
    //             .set("Authorization", "Bearer invalidtoken");

    //         expect(res.status).toBe(401);
    //         expect(res.body.message).toBe("Unauthorized: Invalid or expired token");
    //     });

    //     it("should return 401 Unauthorized if no token provided", async () => {
    //         const res = await request(app).get(getCurrentUserProfile);

    //         expect(res.status).toBe(401);
    //         expect(res.body.message).toBe("Missing or invalid Authorization header");
    //     });

    //     it("should return 403 Forbidden if a user tries to access another user's profile", async () => {
    //         // TODO: implement authorization mechanism later
    //     });

    //     it("should return 403 Forbidden if user is locked", async () => {
    //         // TODO: implement locked user access restriction later
    //     });
    // });

    // describe("PATCH update profile", async () => {
    //     it("should return 200 and updated user", async () => {
    //         const res = await request(app)
    //             .patch(getCurrentUserProfile)
    //             .send({ username: "updated" })
    //             .set("Authorization", userToken);

    //         expect(res.status).toBe(200);
    //         expect(res.body._username).toBe("updated");
    //     });

    //     it("should return 404 if user not found", async () => {
    //         const res = await request(app)
    //             .patch(getCurrentUserProfile)
    //             .send({ username: "abc" })
    //             .set("Authorization", anotherUserToken);

    //         expect(res.status).toBe(404);
    //         expect(res.body.message).toBe("User not found");
    //     });

    //     it("should return 403 if trying to modify root admin", async () => {
    //         const res = await request(app)
    //             .patch(getCurrentUserProfile)
    //             .send({ username: "newname" })
    //             .set("Authorization", rootAdminToken);

    //         expect(res.status).toBe(403);
    //         expect(res.body.message).toBe("Cannot modify root admin");
    //     });

    //     it("should return 401 Unauthorized if no token is provided", async () => {
    //         const res = await request(app).patch(getCurrentUserProfile).send({ username: "abc" });

    //         expect(res.status).toBe(401);
    //         expect(res.body.message).toBe("Missing or invalid Authorization header");
    //     });

    //     it("should return 401 Unauthorized if token is invalid", async () => {
    //         const res = await request(app)
    //             .patch(getCurrentUserProfile)
    //             .send({ username: "abc" })
    //             .set("Authorization", "Bearer invalidtoken123");

    //         expect(res.status).toBe(401);
    //         expect(res.body.message).toBe("Unauthorized: Invalid or expired token");
    //     });
    // });

    describe("DELETE delete profile", () => {
        it("should return 200 when user is deleted successfully", async () => {
            const res = await request(app)
                .delete(getCurrentUserProfile)
                .set("Authorization", userToken);

            expect(res.status).toBe(204);
        });

        it("should return 404 if user not found", async () => {
            const res = await request(app)
                .delete(getCurrentUserProfile)
                .set("Authorization", anotherUserToken); // token points to a non-existent user

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("User not found");
        });

        it("should return 403 if trying to delete root admin", async () => {
            const res = await request(app)
                .delete(getCurrentUserProfile)
                .set("Authorization", rootAdminToken);

            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Cannot delete root admin");
        });

        it("should return 401 Unauthorized if no token is provided", async () => {
            const res = await request(app).delete(getCurrentUserProfile);

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Missing or invalid Authorization header");
        });

        it("should return 401 Unauthorized if token is invalid", async () => {
            const res = await request(app)
                .delete(getCurrentUserProfile)
                .set("Authorization", "Bearer invalidtoken123");

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Unauthorized: Invalid or expired token");
        });
    });
});
