import { PrismaClient, users as PrismaUser } from "../prisma/generated/client";
import {
    CreateVolunteerDto,
    UpdateUserDto,
    ListUserFilterDto,
    Credentials,
    PublicUserProfile,
    AdminUserView,
    AuthUser,
} from "../../application/dtos/user.dto";
import { IUserRepository } from "../../domain/repositories/user.irepositoty";
import { User } from "../../domain/entities/user.entity";
import { UserNotFoundError, CannotModifyRootAdminError } from "../../domain/errors/user.error";
import {
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    AccountLockedError,
    AccountPendingError,
} from "../../domain/errors/auth.error";
import { UserRole, UserStatus } from "../../domain/entities/enums";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";

import logger from "../../logger";
import bcrypt from "bcrypt";
import "dotenv/config";
import { AuthContext } from "../../application/policies/helpers";
import { LoginStreakDto } from "../../application/dtos/users/login-streak.dto";
import { MonthlyEventStatsDto } from "../../application/dtos/users/monthly-event-stats.dto";
import { UserDailyActivityRow } from "../../application/dtos/users/week-online-stats.dto";
import {
    WeeklyEventCountRow,
    WeeklyEventParticipationDto,
} from "../../application/dtos/users/weekly-event-participant.dto";
import { UserDailyActivity } from "../../application/dtos/users/user-daily-activity.dto";

const ROOT_ADMIN_ID = process.env.ROOT_ADMIN_ID;
const LIMIT_SEARCH_USERS = process.env.LIMIT_SEARCH_USERS;

export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Core CRUD
    async create(user: CreateVolunteerDto): Promise<AuthUser> {
        logger.debug(
            {
                email: user.email,
                action: "create",
            },
            "[UserRepository] Creating new volunteer user"
        );

        const newUserId = await this.insert(user);

        const createdUser = await this.prisma.users.findUniqueOrThrow({
            where: { id: newUserId },
        });

        return {
            id: createdUser.id.toString(),
            email: createdUser.email,
            username: createdUser.username,
            avatarUrl: createdUser.avatar_url ?? "",
            role: createdUser.role,
            status: createdUser.status,
            notifications: [],
            lastLogin: createdUser.last_login ?? null,
        };
    }

    async findById(id: string): Promise<User> {
        logger.debug(
            {
                userId: id,
                action: "findById",
            },
            "[UserRepository] Fetching user by ID"
        );

        const user = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!user) {
            logger.warn(
                {
                    userId: id,
                    action: "findById",
                },
                "[UserRepository] User not found"
            );

            throw new UserNotFoundError(id);
        }

        // NOTE: Currently fetching all related entities (events, posts, notifications),
        // but some fields may not be needed immediately.
        // To reduce load, these can be removed here and fetched via separate APIs when required.
        const [participatedEventIds, registeredEventIds, notificationIds, postIds] =
            await Promise.all([
                this.findParticipatedEventIds(id),
                this.findRegisteredEventIds(id),
                this.findNotificationIds(id),
                this.findPostIdsByUserId(id),
            ]);

        // map Prisma result to domain entity
        return this.toDomain({
            ...user,
            participatedEventIds,
            registeredEventIds,
            notificationIds,
            postIds,
        });
    }

    // update user and return updated domain entity
    async update(id: string, data: UpdateUserDto): Promise<User> {
        logger.debug(
            {
                userId: id,
                action: "update",
            },
            "[UserRepository] Updating user"
        );

        await this.checkRootAdminAndExistedId(id);

        const updateUser = await this.prisma.users.update({
            where: { id },
            data: {
                ...(data.username && { username: data.username }),
                ...(data.passwordHash && { password_hash: data.passwordHash }),
                ...(data.avatarUrl && { avatar_url: data.avatarUrl }),
                updated_at: new Date(),
            },
        });

        return await this.findById(id);
    }

    // mark status as deleted not hard delete
    async softDelete(id: string): Promise<void> {
        logger.debug(
            {
                userId: id,
                action: "softDelete",
            },
            "[UserRepository] Soft-deleting user"
        );

        await this.checkRootAdminAndExistedId(id);

        await this.prisma.users.update({
            where: { id },
            data: {
                status: UserStatus.Deleted,
                updated_at: new Date(),
            },
        });
    }

    // Auth-related
    async findAuthUserByCredentials(credentials: Credentials): Promise<AuthUser | null> {
        logger.debug(
            {
                email: credentials.email,
                action: "findAuthUserByCredentials",
            },
            "[UserRepository] Authenticating user credentials"
        );

        const { email, password } = credentials;
        const user = await this.prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new InvalidCredentialsError();
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            logger.warn({ email }, "[UserRepository] Invalid credentials");
            throw new InvalidCredentialsError();
        }

        // locked and pending account can not login
        switch (user.status) {
            case "locked":
                logger.warn(
                    {
                        email,
                    },
                    "[UserRepository] Account is locked"
                );
                throw new AccountLockedError();
            case "pending":
                logger.warn(
                    {
                        email,
                    },
                    "[UserRepository] Account is pending approval"
                );
                throw new AccountPendingError();
        }

        return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            avatarUrl: user.avatar_url,
            role: user.role,
            status: user.status,
            notifications: [],
            lastLogin: user.last_login ?? null,
        };
    }

    async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
        logger.debug(
            {
                userId: userId,
                action: "updatePassword",
            },
            "[UserRepository] Updating user password"
        );

        await this.checkRootAdminAndExistedId(userId);
        await this.prisma.users.update({
            where: { id: userId },
            data: { password_hash: newPasswordHash },
        });
    }

    async updateLastLogin(userId: string, at?: Date): Promise<void> {
        logger.debug(
            {
                userId: userId,
                action: "updateLastLogin",
            },
            "[UserRepository] Updating last login timestamp"
        );

        await this.checkRootAdminAndExistedId(userId);
        const now = at ?? new Date();
        await this.prisma.users.update({
            where: { id: userId },
            data: { last_login: now },
        });
    }

    // Public View
    async fetchPublicProfile(userId: string): Promise<PublicUserProfile> {
        logger.debug(
            {
                userId: userId,
                action: "fetchPublicProfile",
            },
            "[UserRepository] Fetching public profile"
        );

        // no one can view root profile
        await this.checkRootAdminAndExistedId(userId);
        const user = await this.prisma.users.findUnique({
            where: {
                id: userId,
                status: { notIn: ["deleted", "locked"] },
            },
            select: {
                id: true,
                username: true,
                avatar_url: true,
                role: true,
            },
        });

        if (!user) {
            logger.warn(
                {
                    userId: userId,
                    action: "fetchPublicProfile",
                },
                "[UserRepository] Public profile not found"
            );
            throw new UserNotFoundError(userId);
        }

        return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar_url,
            role: user.role,
        };
    }

    // search public users (exclude root admin)
    async searchPublicProfilesByDisplayName(username: string): Promise<PublicUserProfile[] | null> {
        logger.debug(
            {
                username: username,
                action: "searchPublicProfileByDisplayName",
            },
            "[UserRepository] Searching public profile by display name"
        );

        const users = await this.prisma.users.findMany({
            where: {
                username: {
                    contains: username,
                    mode: "insensitive",
                },
                status: { notIn: ["locked", "deleted"] },
                role: { not: "root_admin" },
            },
            select: {
                id: true,
                username: true,
                avatar_url: true,
                role: true,
            },
        });

        return users.map((user) => ({
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar_url,
            role: user.role,
        }));
    }

    // Admin view
    async fetchAdminUserView(userId: string): Promise<AdminUserView | null> {
        logger.debug(
            {
                userId: userId,
                action: "fetchAdminUserView",
            },
            "[UserRepository] Fetching user profile for admin"
        );

        await this.checkRootAdminAndExistedId(userId);

        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatar_url: true,
                role: true,
                status: true,
                last_login: true,
                created_at: true,
            },
        });

        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatar_url,
            role: user.role,
            status: user.status,
            lastLogin: user.last_login,
            createdAt: user.created_at,
        };
    }

    // for admin only (include root admin)
    async listUsers(
        filter: ListUserFilterDto | undefined,
        pagination: Pagination,
        sort: SortOption
    ): Promise<ListResult<AdminUserView>> {
        logger.debug(
            {
                filter,
                pagination,
                sort,
                action: "listUser",
            },
            "[UserRepository] Listing users (admin view)"
        );

        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filter?.role) {
            conditions.push(`role = $${idx++}::user_role`);
            params.push(filter.role);
        }
        if (filter?.status) {
            conditions.push(`status = $${idx++}::user_status`);
            params.push(filter.status);
        }
        if (filter?.search) {
            conditions.push(
                `(LOWER(username) LIKE LOWER($${idx}) OR LOWER(email) LIKE LOWER($${idx}))`
            );
            params.push(`%${filter.search}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const offset = (pagination.page - 1) * pagination.limit;
        const orderBy = `${sort.field} ${sort.order}`;

        logger.debug(
            { whereClause, orderBy, offset, limit: pagination.limit },
            "[UserRepository] Executing user list query"
        );

        const total = await this.count(filter);

        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<
            {
                id: string;
                username: string;
                email: string;
                avatar_url: string | null;
                status: string;
                role: string;
                created_at: Date;
                last_login: Date | null;
            }[]
        >(
            `
            SELECT id, username, email, avatar_url, status, role, created_at, last_login
            FROM users 
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${pagination.limit};`,
            ...params
        );

        //Map to DTO
        const items: AdminUserView[] = itemsRaw.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            avatarUrl: u.avatar_url,
            status: u.status,
            role: u.role,
            createdAt: u.created_at,
            lastLogin: u.last_login ?? undefined,
        }));

        return { items, total, page: pagination.page, limit: pagination.limit };
    }

    async setUserLock(id: string, locked: boolean): Promise<void> {
        logger.debug(
            {
                userId: id,
                isLocked: locked,
                action: "setUserLock",
            },
            "[UserRepository] Locking/Unlocking user"
        );

        await this.checkRootAdminAndExistedId(id);
        await this.prisma.users.update({
            where: { id },
            data: { status: locked ? UserStatus.Locked : UserStatus.Active },
        });
    }

    async count(filter?: ListUserFilterDto): Promise<number> {
        logger.debug(
            {
                filter: filter,
                action: "count",
            },
            "[UserRepository] Counting user by filter"
        );

        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filter?.role) {
            conditions.push(`role = $${idx++}::user_role`);
            params.push(filter.role);
        }
        if (filter?.status) {
            conditions.push(`status = $${idx++}::user_status`);
            params.push(filter.status);
        }
        if (filter?.search) {
            conditions.push(
                `(LOWER(username) LIKE LOWER($${idx}) OR LOWER(email) LIKE LOWER($${idx}))`
            );
            params.push(`%${filter.search}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Total count
        const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
            `SELECT COUNT(*) as count FROM "users" ${whereClause};`,
            ...params
        );

        return Number(result[0]?.count ?? 0);
    }

    // =============== stats =================
    /**
     * Increments the login count for today.
     * If the record doesn't exist for today, it creates it.
     */
    async trackLogin(userId: string): Promise<UserDailyActivity> {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        logger.debug(
            {
                userId,
                activityDate: today,
                action: "trackLogin",
            },
            "[UserRepository] Tracking user login"
        );

        const row = await this.prisma.user_daily_activity.upsert({
            where: {
                user_id_activity_date: {
                    user_id: userId,
                    activity_date: today,
                },
            },
            update: {
                login_count: { increment: 1 },
            },
            create: {
                user_id: userId,
                activity_date: today,
                login_count: 1,
                online_seconds: 0,
            },
        });
        return {
            userId: row.user_id,
            activityDate: row.activity_date,
            onlineSeconds: row.online_seconds,
            loginCount: row.login_count,
        };
    }

    /**
     * Adds online seconds to the user's daily total.
     */
    async updateOnlineTime(userId: string, seconds: number): Promise<void> {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Normalize to SQL DATE (midnight)

        logger.debug(
            {
                userId,
                activityDate: today,
                secondsToAdd: seconds,
                action: "updateOnlineTime",
            },
            "[UserRepository] Updating online activity time"
        );

        await this.prisma.user_daily_activity.update({
            where: {
                user_id_activity_date: {
                    user_id: userId,
                    activity_date: today,
                },
            },
            data: {
                online_seconds: { increment: seconds },
            },
        });
    }

    // async getLoginStreak(
    //     userId: string,
    //     year: number,
    //     month: number // 1-12
    // ): Promise<LoginStreakDto> {
    //     logger.debug(
    //         { userId, year, month, action: "getLoginStreak" },
    //         "[UserRepository] Fetching login streak for user"
    //     );
    //     const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    //     const monthEnd = `
    //         (DATE '${monthStart}' + INTERVAL '1 month' - INTERVAL '1 day')::date
    //     `;

    //     const rows = await this.prisma.$queryRawUnsafe<{ activity_date: string }[]>(
    //         `
    //         SELECT activity_date::text
    //         FROM user_daily_activity
    //         WHERE user_id = $1::uuid
    //             AND activity_date BETWEEN $2::date AND ${monthEnd}
    //         ORDER BY activity_date ASC
    //         `,
    //         userId,
    //         monthStart
    //     );

    //     return {
    //         month: `${year}-${String(month).padStart(2, "0")}`,
    //         activeDates: rows.map((r) => r.activity_date),
    //     };
    // }
    async getActivityDatesInMonth(
        userId: string,
        start: string,
        end: string
    ): Promise<{ activity_date: string }[]> {
        logger.debug(
            { userId, start, end, action: "getActivityDatesInMonth" },
            "[UserRepository] Fetching activity dates"
        );

        return await this.prisma.$queryRawUnsafe<{ activity_date: string }[]>(
            `SELECT activity_date::text FROM user_daily_activity
             WHERE user_id = $1::uuid AND activity_date BETWEEN $2::date AND $3::date
             ORDER BY activity_date ASC`,
            userId,
            start,
            end
        );
    }

    // async getMonthlyEventStats(userId: string, year: number): Promise<MonthlyEventStatsDto> {
    //     logger.debug(
    //         { userId, year, action: "getMonthlyEventStats" },
    //         "[UserRepository] Calculating monthly event stats"
    //     );
    //     const rows = await this.prisma.$queryRawUnsafe<{ month: number; count: number }[]>(
    //         `
    //         SELECT
    //             EXTRACT(MONTH FROM r.created_at)::int AS month,
    //             COUNT(*)::int AS count
    //         FROM registrations r
    //         WHERE r.user_id = $1::uuid
    //             AND r.status = 'approved'
    //             AND EXTRACT(YEAR FROM r.created_at) = $2
    //         GROUP BY month
    //         ORDER BY month
    //         `,
    //         userId,
    //         year
    //     );

    //     // fill missing months
    //     const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
    //         const m = i + 1;
    //         const found = rows.find((r) => r.month === m);
    //         return {
    //             month: m,
    //             joinedEvents: found?.count ?? 0,
    //         };
    //     });

    //     return { year, monthlyCounts };
    // }
    async getApprovedRegistrationCountsByYear(userId: string, year: number): Promise<{ month: number; count: number }[]> {
        logger.debug({ userId, year, action: "getApprovedRegistrationCountsByYear" }, "[UserRepository] Fetching registration counts");

        return await this.prisma.$queryRawUnsafe<{ month: number; count: number }[]>(
            `SELECT EXTRACT(MONTH FROM r.created_at)::int AS month, COUNT(*)::int AS count
             FROM registrations r
             WHERE r.user_id = $1::uuid AND r.status = 'approved' AND EXTRACT(YEAR FROM r.created_at) = $2
             GROUP BY month ORDER BY month`,
            userId, year
        );
    }

    async getDailyOnlineActivity(userId: string, from: Date): Promise<UserDailyActivityRow[]> {
        logger.debug(
            { userId, from, action: "getDailyOnlineActivity" },
            "[UserRepository] Fetching daily online activity"
        );

        return await this.prisma.$queryRawUnsafe<UserDailyActivityRow[]>(
            `
            SELECT
                activity_date::date AS "activityDate",
                online_seconds AS "onlineSeconds"
            FROM user_daily_activity
            WHERE user_id = $1::uuid
                AND activity_date >= $2::date
            `,
            userId,
            from
        );
    }

    async getWeeklyEventParticipation(
        userId: string,
        target = 10
    ): Promise<WeeklyEventParticipationDto> {
        logger.debug(
            { userId, target, action: "getWeeklyEventParticipation" },
            "[UserRepository] Checking weekly event participation progress"
        );

        const row = await this.prisma.$queryRawUnsafe<{ count: number; week_start: string }[]>(
            `
            SELECT
                date_trunc('week', r.created_at)::date AS week_start,
                COUNT(*)::int AS count
            FROM registrations r
            WHERE r.user_id = $1::uuid
                AND r.status = 'approved'
                AND r.created_at >= date_trunc('week', now())
            GROUP BY week_start
            `,
            userId
        );

        const joinedEvents = row[0]?.count ?? 0;
        const weekStart = row[0]?.week_start ?? new Date().toISOString().slice(0, 10);

        return {
            weekStart,
            joinedEvents,
            target,
            progressPercent: Math.min(100, (joinedEvents / target) * 100),
        };
    }

    async getWeeklyApprovedEventCount(
        userId: string,
        weekStart: Date
    ): Promise<WeeklyEventCountRow | null> {
        logger.debug(
            { userId, weekStart, action: "getWeeklyApprovedEventCount" },
            "[UserRepository] Fetching weekly approved event count"
        );

        const rows = await this.prisma.$queryRawUnsafe<WeeklyEventCountRow[]>(
            `
            SELECT
                date_trunc('week', r.created_at)::date AS "weekStart",
                COUNT(*)::int AS "count"
            FROM registrations r
            WHERE r.user_id = $1::uuid
                AND r.status = 'approved'
                AND r.created_at >= $2::date
            GROUP BY 1
            `,
            userId,
            weekStart
        );

        return rows[0] ?? null;
    }

    // ================ utils =================
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.users.count({
            where: { id },
            take: 1,
        });
        return count > 0;
    }

    async getAuthContext(id: string): Promise<AuthContext> {
        logger.debug(
            { userId: id, action: "getAuthContext" },
            "[UserRepository] Fetching id, role and status"
        );

        const user = await this.prisma.users.findUnique({
            where: { id },
            select: { id: true, role: true, status: true },
        });

        if (!user) {
            logger.warn(
                { userId: id, action: "getAuthContext" },
                "[UserRepository] User not found"
            );
            throw new UserNotFoundError(id);
        }

        return {
            id: user.id,
            role: user.role,
            status: user.status,
        };
    }

    private async checkRootAdminAndExistedId(id: string) {
        logger.trace(
            {
                userId: id,
                action: "checkRootAdminAndExistedId",
            },
            "[UserRepository] Checking Root Admin and existed id"
        );

        if (id === ROOT_ADMIN_ID) {
            logger.error(
                {
                    userId: id,
                    action: "checkRootAdminAndExistedId",
                },
                "[UserRepository] Attempted modification of root admin"
            );

            throw new CannotModifyRootAdminError();
        }

        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) {
            logger.warn(
                {
                    userId: id,
                    action: "checkRootAdminAndExistedId",
                },
                "[UserRepository] User not found"
            );

            throw new UserNotFoundError(id);
        }
    }

    private async insert(user: CreateVolunteerDto): Promise<string> {
        logger.trace(
            {
                email: user.email,
                action: "insert",
            },
            "[UserRepository] Inserting a user into database"
        );

        const existing = await this.prisma.users.findUnique({ where: { email: user.email } });
        if (existing) {
            logger.warn(
                {
                    email: user.email,
                },
                "[UserRepository] Duplicate email detected"
            );

            throw new EmailAlreadyExistsError(user.email);
        }

        const newUser = await this.prisma.users.create({
            data: {
                username: user.username,
                email: user.email,
                password_hash: user.passwordHash,
                role: UserRole.Volunteer,
                status: UserStatus.Active,
            },
            select: { id: true },
        });

        return newUser.id;
    }

    // fetch related entity IDs
    private async findParticipatedEventIds(userId: string): Promise<string[]> {
        logger.trace(
            {
                userId: userId,
                action: "findParticipatedEventIds",
            },
            "[UserRepository] Fetching participated event IDs"
        );
        const result = await this.prisma.registrations.findMany({
            where: {
                user_id: userId,
                status: "approved",
            },
            select: { event_id: true },
        });
        return result.map((r: { event_id: string }) => r.event_id);
    }

    private async findRegisteredEventIds(userId: string): Promise<string[]> {
        logger.trace(
            {
                userId: userId,
                action: "findRegisteredEventIds",
            },
            "Fetching registered event IDs"
        );

        const result = await this.prisma.registrations.findMany({
            where: { user_id: userId },
            select: { event_id: true },
        });
        return result.map((r: { event_id: string }) => r.event_id);
    }

    private async findNotificationIds(userId: string): Promise<string[]> {
        logger.trace(
            {
                userId: userId,
                action: "findNotificationIds",
            },
            "[UserRepository] Fetching notification IDs"
        );

        const result = await this.prisma.notifications.findMany({
            where: { user_id: userId },
            select: { id: true },
        });
        return result.map((r: { id: string }) => r.id);
    }

    private async findPostIdsByUserId(userId: string): Promise<string[]> {
        logger.trace(
            {
                authorId: userId,
                action: "findPostIds",
            },
            "[UserRepository] Fetching post IDs of user"
        );

        const result = await this.prisma.posts.findMany({
            where: { author_id: userId },
            select: { id: true },
        });
        return result.map((r: { id: string }) => r.id);
    }

    private toDomain(
        prismaUser: PrismaUser & {
            participatedEventIds?: string[];
            registeredEventIds?: string[];
            notificationIds?: string[];
            postIds?: string[];
        }
    ): User {
        logger.trace(
            {
                userId: prismaUser.id,
                action: "toDomain",
            },
            "[UserRepository] Mapping PrismaUser to domain User"
        );

        return new User({
            id: prismaUser.id,
            username: prismaUser.username,
            email: prismaUser.email,
            passwordHash: prismaUser.password_hash,
            avatarUrl: prismaUser.avatar_url,
            role: prismaUser.role as UserRole,
            status: prismaUser.status as UserStatus,
            lastLogin: prismaUser.last_login,
            updatedAt: prismaUser.updated_at,

            participatedEventIds: prismaUser.participatedEventIds ?? [],
            registeredEventIds: prismaUser.registeredEventIds ?? [],
            notificationIds: prismaUser.notificationIds ?? [],
            postIds: prismaUser.postIds ?? [],
        });
    }
}
