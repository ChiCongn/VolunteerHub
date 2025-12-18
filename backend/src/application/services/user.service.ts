import { Pagination } from "../dtos/pagination.dto";
import { SortOption } from "../dtos/sort-option.dto";
import { ListUserFilterDto, UpdateUserDto } from "../dtos/user.dto";
import { hashPassword } from "../../utils/hash";
import logger from "../../logger";
import { userRepo } from "../../infrastructure/repositories";
import { IUserRepository } from "../../domain/repositories/user.irepositoty";

export class UserService {
    constructor(private readonly userRepo: IUserRepository) {}

    // admin
    async listUsers(
        filter?: ListUserFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ) {
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
        return this.userRepo.setUserLock(userId, locked);
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
}

export const userService = new UserService(userRepo);
