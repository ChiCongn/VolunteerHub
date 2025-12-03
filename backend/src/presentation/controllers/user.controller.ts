import { ListUserFilterDto } from "../../application/dtos/user.dto";
import { userService, UserService } from "../../application/service/user.service";
import { Request, RequestHandler, Response } from "express";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListUserFilter } from "../validators/user/list-user-filter.schema";
import { UserRole } from "../../domain/entities/enums";
import { CannotModifyRootAdminError, UserNotFoundError } from "../../domain/errors/user.error";
import logger from "../../logger";

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

        const filter: ListUserFilterDto = { role, status, search };

        const pagination: Pagination = { page, limit };

        const sortOption: SortOption = { field: sortBy, order };

        const result = await this.userService.listUsers(filter, pagination, sortOption);

        return res.status(200).json(result);
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

            console.log(err);
            logger.error(
                { error: err, action: "fetchUserPublicProfile" },
                "[UserController] fetch public profile failed"
            );
            return res.status(500).json({ message: "Failed to fetch user profile" });
        }
    };

    setUserLock = async (req: Request, res: Response) => {
        logger.info(
            { userId: req.user.sub, action: "setUserLock" },
            "[UserController] Fetch user public profile"
        );

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

            console.log(err);
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

            console.log(err);
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

            const updated = await this.userService.updateProfile(userId, {
                username,
                password,
                avatarUrl,
            });

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

    searchUserByUsername: RequestHandler<never, any, never, { username: string }> = async (req, res: Response) => {
        const { username } = req.query;
        logger.info(
            { username, action: "searchUserByUsername" },
            "[UserController] Searching users by username"
        );

        try {
            const result = await this.userService.searchPublicProfilesByDisplayName(username);
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            logger.error(
                { error: err, action: "searchUserByUsername" },
                "[UserController] Failed to search user"
            );

            return res.status(500).json({ message: "Failed to search user" });
        }
    };
}

export const userController = new UserController(userService);
