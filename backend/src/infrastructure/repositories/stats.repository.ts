import { IStatsRepository } from "../../domain/repositories/stats.irepository";
import {
    OverviewStatsDto,
    EventsStatsDto,
    EventsStatsFilterDto,
    EventStatsDto,
    TrendingEventDto,
    VolunteerStatsDto,
    TimeSeriesPoint,
    TimeSeriesDto,
    EventManagerStatsDto,
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

    // async getOverviewStats(): Promise<OverviewStatsDto> {
    //     logger.debug("[StatsRepository] get overview of app");
    //     const today = dateRange(1);
    //     const week = dateRange(7);

    //     const [row] = await this.prisma.$queryRaw<
    //         Array<{
    //             total_users: bigint;
    //             active_users: bigint;
    //             new_users_today: bigint;

    //             total_events: bigint;
    //             active_events: bigint;
    //             ongoing_events: bigint;
    //             upcoming_events: bigint;

    //             total_regs: bigint;
    //             regs_today: bigint;
    //             regs_week: bigint;
    //         }>
    //     >`
    //     SELECT
    //         (SELECT COUNT(*) FROM users) AS total_users,
    //         (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
    //         (SELECT COUNT(*) FROM users WHERE created_at >= ${today.start}) AS new_users_today,

    //         (SELECT COUNT(*) FROM events) AS total_events,
    //         (SELECT COUNT(*) FROM events WHERE status IN ('approved', 'pending')) AS active_events,
    //         (SELECT COUNT(*) FROM events WHERE status = 'ongoing') AS ongoing_events,
    //         (SELECT COUNT(*) FROM events WHERE start_time > NOW()) AS upcoming_events,

    //         (SELECT COUNT(*) FROM registrations) AS total_regs,
    //         (SELECT COUNT(*) FROM registrations WHERE created_at >= ${today.start}) AS regs_today,
    //         (SELECT COUNT(*) FROM registrations WHERE created_at >= ${week.start}) AS regs_week
    //     `;

    //     return {
    //         users: {
    //             total: Number(row.total_users),
    //             active: Number(row.active_users),
    //             newToday: Number(row.new_users_today),
    //         },
    //         events: {
    //             total: Number(row.total_events),
    //             active: Number(row.active_events),
    //             ongoing: Number(row.ongoing_events),
    //             upcoming: Number(row.upcoming_events),
    //         },
    //         registrations: {
    //             total: Number(row.total_regs),
    //             today: Number(row.regs_today),
    //             thisWeek: Number(row.regs_week),
    //         },
    //     };
    // }

    async getOverviewStats(): Promise<OverviewStatsDto> {
        logger.debug("[StatsRepository] Fetching overview of app");

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Generate a series for days of the month
        const dailySeries = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        // Daily logins
        const dailyLoginsRaw = await this.prisma.$queryRaw<Array<{ day: number; count: bigint }>>`
            SELECT
                EXTRACT(DAY FROM last_login) AS day,
                COUNT(*) AS count
            FROM users
            WHERE last_login >= ${startOfMonth}
            GROUP BY day
            ORDER BY day
        `;

        const dailyLogins = dailySeries.map((day) => {
            const row = dailyLoginsRaw.find((r) => Number(r.day) === day);
            return row ? Number(row.count) : 0;
        });

        // Daily events created
        const dailyCreatedRaw = await this.prisma.$queryRaw<Array<{ day: number; count: bigint }>>`
            SELECT
                EXTRACT(DAY FROM created_at) AS day,
                COUNT(*) AS count
            FROM events
            WHERE created_at >= ${startOfMonth}
            GROUP BY day
            ORDER BY day
        `;

        const dailyCreated = dailySeries.map((day) => {
            const row = dailyCreatedRaw.find((r) => Number(r.day) === day);
            return row ? Number(row.count) : 0;
        });

        // Daily registrations
        const dailyRegsRaw = await this.prisma.$queryRaw<Array<{ day: number; count: bigint }>>`
            SELECT
                EXTRACT(DAY FROM created_at) AS day,
                COUNT(*) AS count
            FROM registrations
            WHERE created_at >= ${startOfMonth}
            GROUP BY day
            ORDER BY day
        `;

        const dailyRegistrations = dailySeries.map((day) => {
            const row = dailyRegsRaw.find((r) => Number(r.day) === day);
            return row ? Number(row.count) : 0;
        });

        // Top events by registrations
        const topEventsByRegistration = await this.prisma.$queryRaw<
            Array<{ name: string; count: bigint }>
            >`
            SELECT e.name, COUNT(r.id) AS count
            FROM events e
            LEFT JOIN registrations r ON r.event_id = e.id
            GROUP BY e.id
            ORDER BY count DESC
            LIMIT 5
        `;

        // Totals
        const [totals] = await this.prisma.$queryRaw<
            Array<{
                total_users: bigint;
                active_users: bigint;
                new_users_month: bigint;
                total_events: bigint;
                active_events: bigint;
                completed_events: bigint;
                canceled_events: bigint;
                total_regs: bigint;
            }>
        >`
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
            (SELECT COUNT(*) FROM users WHERE created_at >= ${startOfMonth}) AS new_users_month,

            (SELECT COUNT(*) FROM events) AS total_events,
            (SELECT COUNT(*) FROM events WHERE status IN ('approved','pending')) AS active_events,
            (SELECT COUNT(*) FROM events WHERE status = 'completed') AS completed_events,
            (SELECT COUNT(*) FROM events WHERE status = 'cancelled') AS canceled_events,

            (SELECT COUNT(*) FROM registrations) AS total_regs
    `;

        return {
            users: {
                dailyLogins,
                totalUsers: Number(totals.total_users),
                activeUsers: Number(totals.active_users),
                newUsers: Number(totals.new_users_month),
            },
            events: {
                dailyCreated,
                totalEvents: Number(totals.total_events),
                activeEvents: Number(totals.active_events),
                completedEvents: Number(totals.completed_events),
                canceledEvents: Number(totals.canceled_events),
            },
            registrations: {
                dailyRegistrations,
                totalRegistrations: Number(totals.total_regs),
                topEventsByRegistration: topEventsByRegistration.map((e) => ({
                    name: e.name,
                    count: Number(e.count),
                })),
            },
        };
    }

    async getEventsStats(filters: EventsStatsFilterDto): Promise<EventsStatsDto> {
        logger.debug(
            {
                action: "getEventsStats",
                filters,
            },
            "[StatsRepository] get overview of all events"
        );

        const { range, status, categories, organizerIds, location, excludeEmpty } = filters;

        const whereClauses: string[] = [];
        const params: any[] = [];

        // 1. Date range  (event created/updated)
        if (range?.from) {
            params.push(range.from);
            whereClauses.push(`e.created_at >= $${params.length}::timestamptz`);
        }
        if (range?.to) {
            params.push(range.to);
            whereClauses.push(`e.created_at <= $${params.length}::timestamptz`);
        }

        // 2. Status filter
        if (status && status.length > 0) {
            params.push(status);
            whereClauses.push(`e.status = ANY($${params.length}::event_status[])`);
        }

        // 3. Category filter
        if (categories && categories.length > 0) {
            params.push(categories);
            whereClauses.push(`e.categories && ARRAY[$${params.length}]::event_category[]`);
        }

        // 4. Organizer (owner) filter
        if (organizerIds && organizerIds.length > 0) {
            params.push(organizerIds);
            whereClauses.push(`e.owner_id = ANY($${params.length})`);
        }

        // 5. Location filter (simple LIKE match)
        if (location) {
            params.push(`%${location}%`);
            whereClauses.push(`e.location ILIKE $${params.length}`);
        }

        // Combine WHERE
        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // If excludeEmpty = true → ignore events with no posts & no participants
        const excludeEmptySQL = excludeEmpty ? `HAVING COUNT(r.id) > 0 OR COUNT(p.id) > 0` : "";

        // Query
        const sql = `
            WITH event_base AS (
                SELECT
                    e.id AS event_id,
                    e.status,
                    COUNT(DISTINCT r.id) AS participant_count,
                    COUNT(DISTINCT p.id) AS post_count
                FROM events e
                LEFT JOIN registrations r ON r.event_id = e.id
                LEFT JOIN posts p ON p.event_id = e.id
                ${whereSQL}
                GROUP BY e.id
                ${excludeEmptySQL}
            )
            SELECT
                COUNT(*) AS total_events,

                COUNT(*) FILTER (WHERE status = 'approved') AS active_events,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_events,

                SUM(participant_count) AS total_participants,
                AVG(participant_count) AS avg_participants,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY participant_count) AS median_participants,

                SUM(post_count) AS total_posts,
                AVG(post_count) AS avg_posts
            FROM event_base;
        `;
        const [row] = await this.prisma.$queryRawUnsafe<
            Array<{
                total_events: bigint;
                active_events: bigint;
                completed_events: bigint;

                total_participants: bigint | null;
                avg_participants: number | null;
                median_participants: number | null;

                total_posts: bigint | null;
                avg_posts: number | null;
            }>
        >(sql, ...params);

        return {
            totalEvents: Number(row.total_events),
            activeEvents: Number(row.active_events),
            completedEvents: Number(row.completed_events),

            participants: {
                total: Number(row.total_participants ?? 0),
                average: Number(row.avg_participants ?? 0),
                median: Number(row.median_participants ?? 0),
            },

            totalPosts: Number(row.total_posts ?? 0),
            avgPostsPerEvent: Number(row.avg_posts ?? 0),
        };
    }

    async getEventStats(
        eventId: string,
        currentPeriodDays: number,
        previousPeriodDays: number
    ): Promise<EventStatsDto> {
        logger.debug(
            {
                eventId: eventId,
                currentDay: currentPeriodDays,
                previousDay: previousPeriodDays,
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

        const { start: currentStart, end: currentEnd } = dateRange(currentPeriodDays);

        const previousEnd = new Date(currentStart); // previousEnd = currentStart
        const previousStart = new Date(previousEnd);
        previousStart.setUTCDate(previousStart.getUTCDate() - previousPeriodDays);

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
                WHERE event_id = ${eventId}::uuid
                AND created_at >= ${currentStart}
                AND created_at < ${currentEnd}
                ) AS cur_regs,

                (SELECT COUNT(*)
                FROM registrations 
                WHERE event_id = ${eventId}::uuid
                AND created_at >= ${previousStart}
                AND created_at < ${previousEnd}
                ) AS prev_regs,

                -- Posts
                (SELECT COUNT(*) 
                FROM posts
                WHERE event_id = ${eventId}::uuid
                AND created_at >= ${currentStart}
                AND created_at < ${currentEnd}
                ) AS cur_posts,

                (SELECT COUNT(*)
                FROM posts
                WHERE event_id = ${eventId}::uuid
                AND created_at >= ${previousEnd}
                AND created_at < ${previousEnd}
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
                from: currentStart.toISOString(),
                to: currentEnd.toISOString(),
            },
            comparisonPeriod: {
                from: previousStart.toISOString(),
                to: previousEnd.toISOString(),
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
                WHERE role = 'volunteer'
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

    async getEventManagersStats(): Promise<EventManagerStatsDto> {
        logger.debug(
            {
                action: "getVolunteerStats",
            },
            "[StatsRepository] Getting volunteer stats"
        );

        const result = await this.prisma.$queryRaw<
            {
                total: bigint;
                active: bigint;
                locked: bigint;
                new_today: bigint;
                new_week: bigint;
            }[]
        >`
            WITH event_manager_users AS (
                SELECT *
                FROM users
                WHERE role = 'event_manager'
            )
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'active') AS active,
                COUNT(*) FILTER (WHERE status = 'locked') AS locked
            FROM event_manager_users;
        `;

        const row = result[0];

        const total = Number(row.total);
        const active = Number(row.active);
        const locked = Number(row.locked);

        return {
            totalEventManagers: total,
            activeCount: active,
            inactiveCount: total - active - locked,
            lockedCount: locked,
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
