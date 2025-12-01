import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { Pagination } from "../dtos/pagination.dto";
import { SortOption } from "../dtos/sort-option.dto";
import { ListUserFilterDto, UpdateUserDto } from "../dtos/user.dto";
import { hashPassword } from "../../utils/hash";
import logger from "../../logger";

export class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    // admin
    async listUsers(filter?: ListUserFilterDto, pagination?: Pagination, sort?: SortOption) {
        logger.debug(
            { filter, pagination, sort, action: "listUsers" },
            "[UserService] Listing users"
        );
        return this.userRepo.listUsers(filter, pagination, sort);
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
        return this.userRepo.fetchPublicProfile(userId);
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
}
