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
            { userId: req.user.id, action: "fetchUserPublicProfile.start" },
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
}

export const userController = new UserController(userService);
