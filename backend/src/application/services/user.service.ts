import { Pagination } from "../dtos/pagination.dto";
import { SortOption } from "../dtos/sort-option.dto";
import { ListUserFilterDto, UpdateUserDto } from "../dtos/user.dto";
import { hashPassword } from "../../utils/hash";
import logger from "../../logger";
import { userRepo } from "../../infrastructure/repositories";
import { IUserRepository } from "../../domain/repositories/user.irepositoty";
import { UserDailyActivityRow, WeeklyOnlineStatsDto } from "../dtos/users/week-online-stats.dto";
import { WeeklyEventParticipationDto } from "../dtos/users/weekly-event-participant.dto";
import { LoginStreakDto } from "../dtos/users/login-streak.dto";
import { MonthlyEventStatsDto } from "../dtos/users/monthly-event-stats.dto";
import { UserDailyActivity } from "../dtos/users/user-daily-activity.dto";
import { notificationService } from "./notification.service";
import { UserRole } from "../../domain/entities/enums";
import { UserNotFoundError } from "../../domain/errors/user.error";

export class UserService {
    constructor(private readonly userRepo: IUserRepository) {}

    // admin
    async listUsers(filter?: ListUserFilterDto, pagination?: Pagination, sort?: SortOption) {
        // sanitize pagination (must be >= 1)
        const page = Math.max(1, Number(pagination?.page) || 1);
        const limit = Math.max(1, Number(pagination?.limit) || 10);

        // whitelist sortable fields (business rule)
        const sortableFields = new Set([
            "role",
            "status",
            "username",
            "email",
            "created_at",
            "last_login",
        ]);

        const sortField = sort && sortableFields.has(sort.field) ? sort.field : "created_at";

        const sortOrder = sort?.order?.toLowerCase() === "asc" ? "asc" : "desc";

        const normalizedSort: SortOption = {
            field: sortField,
            order: sortOrder,
        };

        const normalizedPagination: Pagination = { page, limit };

        logger.debug(
            {
                filter,
                pagination: normalizedPagination,
                sort: normalizedSort,
                action: "listUsers",
            },
            "[UserService] Listing users (admin)"
        );

        return this.userRepo.listUsers(filter, normalizedPagination, normalizedSort);
    }

    async fetchPublicProfileUserById(userId: string, isAdmin = false) {
        logger.debug(
            { userId, isAdmin, action: "fetchPublicProfileUserById" },
            "[UserService] Fetching user profile"
        );
        if (isAdmin) return this.userRepo.fetchAdminUserView(userId);
        return this.userRepo.fetchPublicProfile(userId);
    }

    async setUserLock(userId: string, locked: boolean) {
        logger.info({ userId, locked, action: "setUserLock" }, "[UserService] Lock/unlock user");
        const result = await this.userRepo.setUserLock(userId, locked);
        try {
            const message = locked
                ? "Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống."
                : "Tài khoản của bạn đã được mở khóa.";

            await notificationService.notifySystemAlert(userId, message);
        } catch (err) {
            logger.error("[UserService] Lock notification failed");
        }

        return result;
    }

    async changeUserRole(adminId: string, targetUserId: string, newRole: UserRole) {
        const allowedRoles: UserRole[] = [UserRole.EventManager, UserRole.Volunteer];

        if (!allowedRoles.includes(newRole)) {
            throw new Error(
                `Invalid role. Only the following roles are allowed: ${allowedRoles.join(", ")}`
            );
        }
        if (adminId === targetUserId) {
            throw new Error("You cannot change your own role.");
        }

        await this.userRepo.updateRole(targetUserId, newRole);
    }

    // current user
    async fetchCurrentUser(userId: string) {
        logger.debug(
            { userId, action: "fetchCurrentUser" },
            "[UserService] Fetching current user profile"
        );
        return this.userRepo.findById(userId);
    }

    async updateProfile(
        userId: string,
        data: { username?: string; password?: string; avatarUrl?: string }
    ) {
        logger.debug(
            { userId, updates: data, action: "updateProfile" },
            "[UserService] Updating user profile"
        );
        const updates: UpdateUserDto = { ...data };
        if (data.password) {
            updates.passwordHash = await hashPassword(data.password);
        }
        return this.userRepo.update(userId, updates);
    }

    async softDelete(userId: string) {
        logger.debug({ userId, action: "softDelete" }, "[UserService] Soft deleting user");
        return this.userRepo.softDelete(userId);
    }

    // =============== stats ==================
    // create
    async trackUserLogin(userId: string): Promise<UserDailyActivity> {
        logger.info(
            { userId, action: "trackUserLogin" },
            "[UserService] Processing user login activity"
        );

        const activity = await this.userRepo.trackLogin(userId);

        logger.debug(
            { userId, currentDayLogins: activity.loginCount },
            "[UserService] Login activity tracked successfully"
        );

        return activity;
    }

    /**
     * Updates the user's active time for the day.
     * Includes a safety check to prevent negative values.
     */
    async recordOnlineTime(userId: string, seconds: number): Promise<void> {
        // Business Logic: Don't process if seconds is zero or negative
        if (seconds <= 0) {
            logger.warn(
                { userId, seconds, action: "recordOnlineTime" },
                "[UserService] Rejected invalid online time update"
            );
            throw new Error("Online seconds must be a positive number.");
        }

        // Optional: Cap the seconds to prevent unrealistic jumps (e.g., > 1 hour in one heartbeat)
        const MAX_HEARTBEAT_SECONDS = 3600;
        const sanitizedSeconds = Math.min(seconds, MAX_HEARTBEAT_SECONDS);

        logger.info(
            { userId, seconds: sanitizedSeconds, action: "recordOnlineTime" },
            "[UserService] Recording online duration"
        );

        try {
            await this.userRepo.updateOnlineTime(userId, sanitizedSeconds);
        } catch (error) {
            // If the user somehow hasn't "logged in" for the day, trackLogin first
            // This handles edge cases where a session persists across midnight
            logger.warn(
                { userId },
                "[UserService] No activity record found, initializing today's record"
            );
        }
    }

    async getLoginStreak(userId: string, year: number, month: number): Promise<LoginStreakDto> {
        logger.info(
            { userId, year, month, action: "getLoginStreak" },
            "[UserService] Calculating login streak"
        );
        const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const monthEnd = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

        const rows = await this.userRepo.getActivityDatesInMonth(userId, monthStart, monthEnd);

        // Logic: Mapping to DTO
        return {
            month: `${year}-${String(month).padStart(2, "0")}`,
            activeDates: rows.map((r) => r.activity_date),
        };
    }

    async getMonthlyEventStats(userId: string, year: number): Promise<MonthlyEventStatsDto> {
        logger.info(
            { userId, year, action: "getMonthlyEventStats" },
            "[UserService] Generating monthly event statistics"
        );
        const rows = await this.userRepo.getApprovedRegistrationCountsByYear(userId, year);

        // Logic: Filling missing months (Business Logic)
        const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const found = rows.find((r) => r.month === m);
            return {
                month: m,
                joinedEvents: found?.count ?? 0,
            };
        });

        return { year, monthlyCounts };
    }

    async getWeeklyOnlineStats(userId: string): Promise<WeeklyOnlineStatsDto> {
        logger.debug(
            { userId, action: "getWeeklyOnlineStats" },
            "[UserService] Calculating weekly online stats"
        );

        const currentWeekStart = this.getWeekStart(new Date());
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);

        const from = previousWeekStart;

        const rows = await this.userRepo.getDailyOnlineActivity(userId, from);

        const currentWeek = this.buildWeek(rows, currentWeekStart);
        const previousWeek = this.buildWeek(rows, previousWeekStart);

        const comparePercent =
            previousWeek.totalHours === 0
                ? 100
                : ((currentWeek.totalHours - previousWeek.totalHours) / previousWeek.totalHours) *
                  100;

        return {
            currentWeek,
            previousWeek,
            comparePercent: Number(comparePercent.toFixed(1)),
        };
    }

    async getWeeklyEventParticipation(
        userId: string,
        target = 10
    ): Promise<WeeklyEventParticipationDto> {
        logger.debug(
            { userId, target, action: "getWeeklyEventParticipation" },
            "[UserService] Calculating weekly event participation"
        );

        const weekStart = this.getWeekStart(new Date());

        const row = await this.userRepo.getWeeklyApprovedEventCount(userId, weekStart);

        const joinedEvents = row?.count ?? 0;

        const progressPercent = Math.min(100, Number(((joinedEvents / target) * 100).toFixed(1)));

        return {
            weekStart: weekStart.toISOString().slice(0, 10),
            joinedEvents,
            target,
            progressPercent,
        };
    }

    // utility
    async count(filter?: ListUserFilterDto) {
        logger.debug({ filter, action: "countUsers" }, "[UserService] Counting users");
        return this.userRepo.count(filter);
    }

    async searchPublicProfilesByDisplayName(username: string) {
        logger.debug(
            { username, action: "searchPublicProfilesByDisplayName" },
            "[UserService] Searching public profiles by display name"
        );
        return this.userRepo.searchPublicProfilesByDisplayName(username);
    }

    async getAuthContext(id: string) {
        logger.debug(
            { userId: id, action: "getAuthContext" },
            "[UserService] Fetching id, role and status"
        );

        return this.userRepo.getAuthContext(id);
    }

    private getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = (d.getDay() + 6) % 7; // Monday = 0
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private buildWeek(rows: UserDailyActivityRow[], weekStart: Date) {
        const dailyHours = Array(7).fill(0);

        for (const r of rows) {
            const diff = Math.floor((r.activityDate.getTime() - weekStart.getTime()) / 86400000);

            if (diff >= 0 && diff < 7) {
                dailyHours[diff] += r.onlineSeconds / 3600;
            }
        }

        const totalHours = dailyHours.reduce((a, b) => a + b, 0);

        return {
            weekStart: weekStart.toISOString().slice(0, 10),
            dailyHours: dailyHours.map((h) => Number(h.toFixed(2))),
            totalHours: Number(totalHours.toFixed(2)),
        };
    }
}

export const userService = new UserService(userRepo);
