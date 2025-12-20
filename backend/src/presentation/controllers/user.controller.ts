import { ListUserFilterDto } from "../../application/dtos/user.dto";
import { userService, UserService } from "../../application/services/user.service";
import { Request, RequestHandler, Response } from "express";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListUserFilter } from "../validators/user/list-user-filter.schema";
import { UserRole } from "../../domain/entities/enums";
import { CannotModifyRootAdminError, UserNotFoundError } from "../../domain/errors/user.error";
import logger from "../../logger";
import {
    GetLoginStreakSchema,
    GetMonthlyStatsSchema,
} from "../validators/stats/user-activity.schema";

export class UserController {
    constructor(private readonly userService: UserService) {}

    listUsers: RequestHandler<any, any, any, ListUserFilter> = async (req, res) => {
        // add default value because ts requires it even though zod schema already does that
        const {
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            order = "desc",
            role,
            status,
            search,
        } = req.query;

        logger.info(
            {
                action: "listUsers",
                page,
                limit,
                sortBy,
                order,
                role,
                status,
                search,
                requester: req.user?.sub,
            },
            "[UserController] List users"
        );

        try {
            const filter: ListUserFilterDto = { role, status, search };

            const pagination: Pagination = { page, limit };

            const sortOption: SortOption = { field: sortBy, order };

            const result = await this.userService.listUsers(filter, pagination, sortOption);

            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                {
                    error: err,
                    action: "listUsers.failed",
                },
                "[UserController] List users failed"
            );

            return res.status(500).json({
                message: "Failed to fetch users",
            });
        }
    };

    fetchUserPublicProfile = async (req: Request, res: Response) => {
        logger.info(
            { userId: req.user.sub, action: "fetchUserPublicProfile.start" },
            "[UserController] Fetch user public profile"
        );
        const { userId } = req.params;
        const isAdmin = req.user.role === UserRole.Admin;
        try {
            const result = await this.userService.fetchPublicProfileUserById(userId, isAdmin);
            return res.status(200).json(result);
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                logger.error(
                    { action: "fetchUserPublicProfile" },
                    "[UserController] User not found"
                );
                return res.status(404).json({ message: "User not found" });
            }

            if (err instanceof CannotModifyRootAdminError) {
                logger.error(
                    { action: "fetchUserPublicProfile" },
                    "[UserController] Can not fetch root admin profile"
                );
                return res.status(404).json({ message: "User not found" });
            }

            logger.error(
                { error: err, action: "fetchUserPublicProfile" },
                "[UserController] fetch public profile failed"
            );
            return res.status(500).json({ message: "Failed to fetch user profile" });
        }
    };

    setUserLock = async (req: Request, res: Response) => {
        // logger.info(
        //     { userId: req.user.sub, action: "setUserLock" },
        //     "[UserController] Fetch user public profile"
        // );

        try {
            const { userId } = req.params;
            const { locked } = req.body;
            await this.userService.setUserLock(userId, locked);
            return res.status(204).send();
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                logger.error({ action: "setUserLock" }, "[UserController] User not found");
                return res.status(404).json({ message: "User not found" });
            }

            if (err instanceof CannotModifyRootAdminError) {
                logger.error(
                    { action: "setUserLock" },
                    "[UserController] Can not lock root admin profile"
                );
                return res.status(403).json({ message: "Cannot lock root admin" });
            }

            logger.error(
                { error: err, action: "setUserLock" },
                "[UserController] lock user failed"
            );
            return res.status(500).json({ message: "Failed to lock user profile" });
        }
    };

    getCurrentUserProfile = async (req: Request, res: Response) => {
        const currentUserId = req.user.sub;

        logger.info(
            { userId: currentUserId, action: "getMeProfile" },
            "[UserController] Fetching current user profile"
        );
        try {
            const result = await this.userService.fetchCurrentUser(currentUserId);
            return res.status(200).json(result);
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                logger.error(
                    { userId: currentUserId, action: "getMeProfile" },
                    "[UserController] User not found"
                );
                throw new UserNotFoundError(currentUserId);
            }

            logger.error(
                { userId: currentUserId, error: err, action: "getMeProfile" },
                "[UserController] Failed to fetch current user profile"
            );
            return res.status(500).json({ message: "Failed to get user profile" });
        }
    };

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user.sub;

        logger.info({ userId, action: "updateProfile" }, "[UserController] Updating user profile");

        try {
            const { username, password, avatarUrl } = req.body;

            const file = req.file as Express.Multer.File;

            const updateData: any = {};
            if (username) updateData.username = username;
            if (password) updateData.password = password;

            if (file) {
                updateData.avatarUrl = file.path;
            } else if (avatarUrl) {
                updateData.avatarUrl = avatarUrl;
            }

            const updated = await this.userService.updateProfile(userId, updateData);

            return res.status(200).json(updated);
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                logger.error(
                    { userId, action: "updateProfile" },
                    "[UserController] User not found"
                );
                return res.status(404).json({ message: "User not found" });
            }

            if (err instanceof CannotModifyRootAdminError) {
                logger.error(
                    { userId, action: "updateProfile" },
                    "[UserController] Cannot modify root admin"
                );
                return res.status(403).json({ message: "Cannot modify root admin" });
            }

            logger.error(
                { error: err, userId, action: "updateProfile" },
                "[UserController] Failed to update user profile"
            );

            return res.status(500).json({ message: "Failed to update user profile" });
        }
    };

    softDelete = async (req: Request, res: Response) => {
        const userId = req.user.sub;

        logger.info(
            { userId, action: "softDelete" },
            "[UserController] Soft deleting current user"
        );

        try {
            await this.userService.softDelete(userId);
            return res.status(204).send();
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                logger.error({ userId, action: "softDelete" }, "[UserController] User not found");
                return res.status(404).json({ message: "User not found" });
            }

            if (err instanceof CannotModifyRootAdminError) {
                logger.error(
                    { userId, action: "softDelete" },
                    "[UserController] Cannot delete root admin"
                );
                return res.status(403).json({ message: "Cannot delete root admin" });
            }

            logger.error(
                { error: err, userId, action: "softDelete" },
                "[UserController] Failed to soft delete user"
            );

            return res.status(500).json({ message: "Failed to delete user" });
        }
    };

    searchUserByUsername: RequestHandler<never, any, never, { username: string }> = async (
        req,
        res: Response
    ) => {
        const { username } = req.query;
        logger.info(
            { username, action: "searchUserByUsername" },
            "[UserController] Searching users by username"
        );

        try {
            const result = await this.userService.searchPublicProfilesByDisplayName(username);
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err, action: "searchUserByUsername" },
                "[UserController] Failed to search user"
            );

            return res.status(500).json({ message: "Failed to search user" });
        }
    };

    // =============== stats ==================
    trackUserLogin = async (req: Request, res: Response) => {
        const userId = req.user.sub;
        //const userId = '50b49ca8-b786-43be-9706-78df41ac7f37';

        logger.info(
            { userId, action: "trackUserLogin" },
            "[UserController] Manually tracking user login activity"
        );

        try {
            const activity = await this.userService.trackUserLogin(userId);

            return res.status(200).json({
                message: "Login tracked successfully",
                data: activity,
            });
        } catch (err) {
            logger.error(
                { error: err, userId, action: "trackUserLogin" },
                "[UserController] Failed to track login activity"
            );

            if (err instanceof UserNotFoundError) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(500).json({ message: "Internal server error" });
        }
    };

    getLoginStreak = async (req: Request, res: Response) => {
        const userId = req.user.sub;
        //const userId = '50b49ca8-b786-43be-9706-78df41ac7f37';

        // Use the schema to validate and set defaults
        const { year, month } = GetLoginStreakSchema.query.parse(req.query);

        logger.info(
            { userId, year, month, action: "getLoginStreak" },
            "[UserController] Fetching streak"
        );

        logger.info({ userId, year, month }, "[UserController] Fetching streak");

        try {
            const streak = await this.userService.getLoginStreak(userId, year, month);
            return res.status(200).json(streak);
        } catch (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    updateOnlineTime = async (req: Request, res: Response) => {
        const userId = req.user.sub;
        const { seconds } = req.body;

        logger.info(
            { userId, seconds, action: "updateOnlineTime" },
            "[UserController] Recording heartbeat"
        );

        try {
            await this.userService.recordOnlineTime(userId, seconds);
            return res.status(204).send();
        } catch (err) {
            logger.error({ err, userId }, "[UserController] Heartbeat failed");
            return res.status(400).json({ message: err });
        }
    };

    getMonthlyEventStats = async (req: Request, res: Response) => {
        const userId = req.user.sub;
        const { year } = GetMonthlyStatsSchema.query.parse(req.query);

        logger.info(
            { userId, year, action: "getMonthlyEventStats" },
            "[UserController] Fetching monthly event stats"
        );

        try {
            const stats = await this.userService.getMonthlyEventStats(userId, year);
            return res.status(200).json(stats);
        } catch (err) {
            return res.status(500).json({ message: "Failed to fetch monthly stats" });
        }
    };

    getWeeklyOnline = async (req: Request, res: Response) => {
        const userId = req.user.sub;

        logger.info(
            { userId, action: "getWeeklyOnline" },
            "[UserController] Fetching weekly online summary"
        );

        try {
            // Aggregating two related weekly stats for a cleaner dashboard response
            const online = await this.userService.getWeeklyOnlineStats(userId);

            return res.status(200).json(online);
        } catch (err) {
            logger.error({ err, userId }, "[UserController] Error fetching weekly summary");
            return res.status(500).json({ message: "Failed to fetch weekly summary" });
        }
    };

    getWeeklyEventParticipation = async (req: Request, res: Response) => {
        const userId = req.user.sub;

        logger.info(
            { userId, action: "getWeeklyEventParticipation" },
            "[UserController] Fetching weekly participation"
        );

        try {
            const participation = await this.userService.getWeeklyEventParticipation(userId);
            return res.status(200).json(participation);
        } catch (err) {
            logger.error(
                { err, userId },
                "[UserController] Error fetching weekly event participation"
            );
            return res.status(500).json({ message: "Failed to fetch weekly event participation" });
        }
    };
}

export const userController = new UserController(userService);
