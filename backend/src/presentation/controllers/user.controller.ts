import { ListUserFilterDto } from "../../application/dtos/user.dto";
import { userService, UserService } from "../../application/service/user.service";
import { Request, RequestHandler, Response } from "express";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListUserFilter } from "../validators/user/list-user-filter.schema";

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
}

export const userController = new UserController(userService);
