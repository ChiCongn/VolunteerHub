import request from "supertest";
import { app } from "../../server";
import { describe, expect, it } from "vitest";
import { EventStatus } from "../../domain/entities/enums";

describe("StatsController API - Integration Tests", () => {
    describe("GET /api/stats/overview", () => {
        it("should return overview stats successfully", async () => {
            const res = await request(app).get("/api/v1/stats");
            console.log(res.body);
            expect(res.status).toBe(200);
            expect(res.body.users).not.toBeNull();
            expect(res.body.events).not.toBeNull();
            expect(res.body.registrations).not.toBeNull();
        });
    });

    describe("GET /api/stats/events", () => {
        it("should return aggregated events stats with filters", async () => {
            const filters = { status: [EventStatus.Ongoing, EventStatus.Approved] };
            const res = await request(app).get("/api/v1/stats/events").send(filters);
            console.log(res.body);

            expect(res.status).toBe(200);
            expect(res.body.totalEvents).not.toBeNull();
            expect(res.body.totalPosts).not.toBeNull();
        });
    });

    describe("GET /api/stats/events/:eventId", () => {
        const eventId = "b923efe9-6cf3-4241-8147-d5829f557084";

        it("should return event stats with default 7-day periods", async () => {
            const res = await request(app).get(`/api/v1/stats/events/${eventId}`);
            console.log(res.body);

            expect(res.status).toBe(200);
            expect(res.body.name).toEqual("Plant 1000 Trees at Tao Dan Park");
            expect(res.body.participants).not.toBeNull();
            expect(res.body.posts).not.toBeNull();
        });

        it("should accept custom period days", async () => {
            const res = await request(app)
                .get(`/api/v1/stats/events/${eventId}`)
                .query({ currentPeriodDays: 30, previousPeriodDays: 30 });
            console.log(res.body);

            expect(res.status).toBe(200);
            expect(res.body.name).toEqual("Plant 1000 Trees at Tao Dan Park");
            expect(res.body.participants).not.toBeNull();
            expect(res.body.posts).not.toBeNull();
        });

        it("should return 404 when event not found", async () => {
            const res = await request(app).get(
                "/api/v1/stats/events/c889bc9d-0b1a-4ec0-917c-0c9f72235ccc"
            );
            console.log(res.body);

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: "Event not found" });
        });
    });

    describe("GET /api/stats/trending", () => {
        it("should return top 10 trending events by default (last 7 days)", async () => {
            const res = await request(app).get("/api/v1/stats/trending");
            console.log(res.body);

            expect(res.status).toBe(200);
        });

        it("should accept custom days and limit", async () => {
            const res = await request(app).get("/api/v1/stats/trending").query({ days: 14, limit: 5 });
            console.log(res.body);
            expect(res.status).toBe(200);
        });
    });

    describe("GET /api/stats/volunteers", () => {
        it("should return volunteer statistics", async () => {
            const res = await request(app).get("/api/v1/stats/volunteers");
            console.log(res.body);

            expect(res.status).toBe(200);
            expect(res.body.totalVolunteers).greaterThan(1);
        });
    });

    describe("GET /api/stats/event-managers", () => {
        it("should return event managers statistics", async () => {
            const res = await request(app).get("/api/v1/stats/managers");
            console.log(res.body);

            expect(res.status).toBe(200);
            expect(res.body.totalEventManagers).toBe(2);
        });
    });
});
