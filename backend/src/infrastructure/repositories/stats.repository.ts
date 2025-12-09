import { IStatsRepository } from "../../domain/repositories/stats.irepository";
import {
    OverviewStatsDto,
    EventsStatsDto,
    EventStatsDto,
    TrendingEventDto,
    VolunteerStatsDto,
    TimeSeriesPoint,
    TimeSeriesDto,
} from "../../application/dtos/stats";
import { EventNotFoundError } from "../../domain/errors/event.error";
import { PrismaClient } from "../prisma/generated/client";
import logger from "../../logger";

function dateRange(days: number) {
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days);
    return { start, end };
}

export class StatsRepository implements IStatsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async getOverviewStats(): Promise<OverviewStatsDto> {
        logger.debug("[StatsRepository] get overview of app");
        const today = dateRange(1);
        const week = dateRange(7);

        const [row] = await this.prisma.$queryRaw<
            Array<{
                total_users: bigint;
                active_users: bigint;
                new_users_today: bigint;

                total_events: bigint;
                active_events: bigint;
                upcoming_events: bigint;

                total_regs: bigint;
                regs_today: bigint;
                regs_week: bigint;
            }>
        >`
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
            (SELECT COUNT(*) FROM users WHERE created_at >= ${today.start}) AS new_users_today,

            (SELECT COUNT(*) FROM events) AS total_events,
            (SELECT COUNT(*) FROM events WHERE status IN ('approved', 'pending')) AS active_events,
            (SELECT COUNT(*) FROM events WHERE start_time > NOW()) AS upcoming_events,

            (SELECT COUNT(*) FROM registrations) AS total_regs,
            (SELECT COUNT(*) FROM registrations WHERE created_at >= ${today.start}) AS regs_today,
            (SELECT COUNT(*) FROM registrations WHERE created_at >= ${week.start}) AS regs_week
        `;

        logger.debug(
            {
                totalUsers: row.total_users.toString(),
                activeUsers: row.active_users.toString(),
                newUsersToday: row.new_users_today.toString(),
                totalEvents: row.total_events.toString(),
                activeEvents: row.active_events.toString(),
                upcomingEvents: row.upcoming_events.toString(),
                totalRegistrations: row.total_regs.toString(),
                regsToday: row.regs_today.toString(),
                regsWeek: row.regs_week.toString(),
            },
            "[StatsRepository] getOverviewStats result"
        );

        return {
            users: {
                total: Number(row.total_users),
                active: Number(row.active_users),
                newToday: Number(row.new_users_today),
            },
            events: {
                total: Number(row.total_events),
                active: Number(row.active_events),
                upcoming: Number(row.upcoming_events),
            },
            registrations: {
                total: Number(row.total_regs),
                today: Number(row.regs_today),
                thisWeek: Number(row.regs_week),
            },
        };
    }

    async getEventsStats(): Promise<EventsStatsDto> {
        logger.debug(
            {
                action: "getEventsStats",
            },
            "[StatsRepository] get overview of all events"
        );
        const [row] = await this.prisma.$queryRaw<
            Array<{
                total_events: bigint;
                active_events: bigint;
                completed_events: bigint;

                total_participants: bigint;
                avg_participants: number | null;

                total_posts: bigint;
                avg_posts: number | null;
            }>
        >`
            SELECT
                (SELECT COUNT(*) FROM events) AS total_events,
                (SELECT COUNT(*) FROM events WHERE status IN ('approved', 'pending')) AS active_events,
                (SELECT COUNT(*) FROM events WHERE status = 'completed') AS completed_events,

                (SELECT COUNT(*) FROM registrations) AS total_participants,
                (SELECT AVG(reg_count) 
                FROM (
                    SELECT COUNT(*) AS reg_count
                    FROM registrations 
                    GROUP BY event_id
                ) sub) AS avg_participants,

                (SELECT COUNT(*) FROM posts) AS total_posts,
                (SELECT AVG(post_count)
                FROM (
                    SELECT COUNT(*) AS post_count
                    FROM posts
                    GROUP BY event_id
                ) sub) AS avg_posts
        `;

        return {
            totalEvents: Number(row.total_events),
            activeEvents: Number(row.active_events),
            completedEvents: Number(row.completed_events),

            totalParticipants: Number(row.total_participants),
            avgParticipantsPerEvent: row.avg_participants ? Number(row.avg_participants) : 0,

            totalPosts: Number(row.total_posts),
            avgPostsPerEvent: row.avg_posts ? Number(row.avg_posts) : 0,
        };
    }

    async getEventStats(
        eventId: string,
        daysCurrent: number,
        daysPrevious: number
    ): Promise<EventStatsDto> {
        logger.debug(
            {
                eventId: eventId,
                currentDay: daysCurrent,
                previousDay: daysPrevious,
                action: "getEventStats",
            },
            "[StatsRepository] Geting stats for event"
        );

        const event = await this.prisma.events.findUnique({
            where: { id: eventId },
            select: { id: true, name: true },
        });
        if (!event) {
            logger.warn(
                {
                    eventId: eventId,
                    action: "getEventStats",
                },
                "[StatsRepository] Event not found"
            );
            throw new EventNotFoundError(eventId);
        }

        const { start: curStart, end: curEnd } = dateRange(daysCurrent);
        const { start: prevStart } = dateRange(daysCurrent + daysPrevious);

        const [row] = await this.prisma.$queryRaw<
            Array<{
                cur_regs: bigint;
                prev_regs: bigint;
                cur_posts: bigint;
                prev_posts: bigint;
            }>
        >`
            SELECT
                -- Registrations
                (SELECT COUNT(*) 
                FROM registrations 
                WHERE event_id = ${eventId}
                AND created_at >= ${curStart}
                AND created_at < ${curEnd}
                ) AS cur_regs,

                (SELECT COUNT(*)
                FROM registrations 
                WHERE event_id = ${eventId}
                AND created_at >= ${prevStart}
                AND created_at < ${curStart}
                ) AS prev_regs,

                -- Posts
                (SELECT COUNT(*) 
                FROM posts
                WHERE event_id = ${eventId}
                AND created_at >= ${curStart}
                AND created_at < ${curEnd}
                ) AS cur_posts,

                (SELECT COUNT(*)
                FROM posts
                WHERE event_id = ${eventId}
                AND created_at >= ${prevStart}
                AND created_at < ${curStart}
                ) AS prev_posts
        `;

        const curRegs = Number(row.cur_regs);
        const prevRegs = Number(row.prev_regs);
        const curPosts = Number(row.cur_posts);
        const prevPosts = Number(row.prev_posts);

        const growth = (cur: number, prev: number) =>
            prev === 0 ? (cur === 0 ? 0 : 100) : ((cur - prev) / prev) * 100;

        return {
            eventId,
            name: event.name,
            participants: {
                count: curRegs,
                previousCount: prevRegs,
                growthRate: Number(growth(curRegs, prevRegs).toFixed(2)),
            },
            posts: {
                count: curPosts,
                previousCount: prevPosts,
                growthRate: Number(growth(curPosts, prevPosts).toFixed(2)),
            },
            period: {
                from: curStart.toISOString(),
                to: curEnd.toISOString(),
            },
        };
    }

    async getTrendingEvents(days: number, limit = 10): Promise<TrendingEventDto[]> {
        logger.debug(
            {
                action: "getTrendingEvents",
            },
            "[StatsRepository] Getting tredning events"
        );

        const { start, end } = dateRange(days);

        const rows = await this.prisma.$queryRaw<
            Array<{
                event_id: string;
                name: string;
                recent_regs: bigint;
                total_regs: bigint;
            }>
        >`
            WITH recent AS (
                SELECT 
                    event_id,
                    COUNT(*) AS recent_regs
                FROM registrations
                WHERE created_at >= ${start}
                AND created_at < ${end}
                GROUP BY event_id
            ),
            totals AS (
                SELECT 
                    event_id,
                    COUNT(*) AS total_regs
                FROM registrations
                GROUP BY event_id
            )
            SELECT 
                r.event_id,
                e.name,
                r.recent_regs,
                COALESCE(t.total_regs, 0) AS total_regs
            FROM recent r
            JOIN events e ON e.id = r.event_id
            LEFT JOIN totals t ON t.event_id = r.event_id
            ORDER BY r.recent_regs DESC
            LIMIT ${limit};
        `;

        return rows.map((row, idx) => {
            const increase = Number(row.recent_regs);
            const total = Number(row.total_regs);
            const growthRate = total === 0 ? 0 : Number(((increase / total) * 100).toFixed(2));

            return {
                eventId: row.event_id,
                name: row.name,
                rank: idx + 1,
                currentParticipants: total,
                increaseParticipants: increase,
                growthRate,
                period: {
                    from: start.toISOString(),
                    to: end.toISOString(),
                },
            };
        });
    }

    async getVolunteerStats(): Promise<VolunteerStatsDto> {
        logger.debug(
            {
                action: "getVolunteerStats",
            },
            "[StatsRepository] Getting volunteer stats"
        );

        const today = dateRange(1);
        const week = dateRange(7);

        const result = await this.prisma.$queryRaw<
            {
                total: bigint;
                active: bigint;
                locked: bigint;
                new_today: bigint;
                new_week: bigint;
            }[]
        >`
            WITH volunteer_users AS (
                SELECT *
                FROM users
                WHERE role IN ('volunteer', 'event_manager')
            )
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'active') AS active,
                COUNT(*) FILTER (WHERE status = 'locked') AS locked,
                COUNT(*) FILTER (WHERE created_at >= ${today.start}) AS new_today,
                COUNT(*) FILTER (WHERE created_at >= ${week.start}) AS new_week
            FROM volunteer_users;
        `;

        const row = result[0];

        const total = Number(row.total);
        const active = Number(row.active);
        const locked = Number(row.locked);

        return {
            totalVolunteers: total,
            activeCount: active,
            inactiveCount: total - active - locked,
            lockedCount: locked,
            newVolunteers: {
                today: Number(row.new_today),
                thisWeek: Number(row.new_week),
            },
        };
    }

    async getTimeSeries(
        metric: "users" | "registrations" | "posts",
        days: number
    ): Promise<TimeSeriesDto> {
        const { start } = dateRange(days);
        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);

        // Build raw daily counts
        const raw = await this.prisma.$queryRaw<{ date: string; value: number }[]>`
        SELECT
            date_trunc('day', "createdAt")::date AS date,
            COUNT(*)::int AS value
        FROM
            ${
                metric === "users"
                    ? this.prisma.users
                    : metric === "registrations"
                      ? this.prisma.registrations
                      : this.prisma.posts
            }
        WHERE
            "createdAt" >= ${start}
        GROUP BY date_trunc('day', "createdAt")
        ORDER BY date
        `;

        const filled: TimeSeriesPoint[] = [];
        const cur = new Date(start);
        while (cur <= end) {
            const iso = cur.toISOString().slice(0, 10);
            const found = raw.find((r) => r.date === iso);
            filled.push({ date: iso, value: found?.value ?? 0 });
            cur.setUTCDate(cur.getUTCDate() + 1);
        }

        return {
            label:
                metric === "users"
                    ? "New Users"
                    : metric === "registrations"
                      ? "Registrations"
                      : "Posts",
            data: filled,
        };
    }
}
