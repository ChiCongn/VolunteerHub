import { PrismaClient, Prisma, users as PrismaUser } from "../prisma/generated/client";
import {
    CreateVolunteerDto,
    UpdateUserDto,
    ListUserFilterDto,
    Credentials,
    PublicUserProfile,
    AdminUserView,
    AuthUser
} from "../../application/dtos/user.dto";
import { IUserRepository } from "../../domain/repositories/user.irepositoty";
import { User } from "../../domain/entities/user.entity";
import {
    UserNotFoundError,
    CannotDeleteAlreadyDeletedUserError,
    CannotDeleteLockedUserError,
    CannotModifyRootAdminError,
} from "../../domain/errors/user.error";
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
import { validate as isUuid } from 'uuid';
import "dotenv/config";

const ROOT_ADMIN_ID = process.env.ROOT_ADMIN_ID;
const LIMIT_SEARCH_USERS = process.env.LIMIT_SEARCH_USERS;

export class UserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }

    // Core CRUD
    async create(user: CreateVolunteerDto): Promise<User> {
        logger.info({ email: user.email }, "Creating new volunteer user");
        try {
            const userId = await this.insert(user);

            logger.info({ userId }, "User created successfully, fetching domain object");
            const createdUser = await this.findById(userId);

            return createdUser;
        } catch (err) {
            logger.error({
                error: err instanceof Error ? err.message : err,
                email: user.email,
            }, "Failed to create user");
            // Optional: wrap or rethrow domain errors if needed
            throw err;
        }
    }

    async findById(id: string): Promise<User> {
        if (!isUuid(id)) {
            throw new UserNotFoundError(id);
        }

        logger.debug({ id }, "Fetching user by ID");
        const user = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!user) {
            logger.warn({ id }, "User not found in findById()");
            throw new UserNotFoundError(id);
        }

        logger.debug({ id }, "Found user in DB, resolving relations");
        const [
            participatedEventIds,
            registeredEventIds,
            notificationIds,
            postIds,
        ] = await Promise.all([
            this.findParticipatedEventIds(id),
            this.findRegisteredEventIds(id),
            this.findNotificationIds(id),
            this.findPostIds(id),
        ]);

        logger.debug({ id }, "Finished loading domain user");
        return this.toDomain({
            ...user,
            participatedEventIds,
            registeredEventIds,
            notificationIds,
            postIds,
        });
    }

    async update(id: string, data: UpdateUserDto): Promise<User> {
        logger.info({ id }, "Updating user");
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

        logger.debug({ id }, "User updated successfully, refetching domain object");
        return await this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        logger.info({ id }, "Soft-deleting user");
        await this.checkRootAdminAndExistedId(id);

        await this.prisma.users.update({
            where: { id },
            data: {
                status: UserStatus.Deleted,
                updated_at: new Date(),
            },
        });
        logger.info({ id }, "User soft-deleted successfully");
    }

    // Auth-related
    async findAuthUserByCredentials(credentials: Credentials): Promise<AuthUser | null> {
        logger.debug({ email: credentials.email }, "Authenticating user credentials");
        const { email, passwordHash } = credentials;

        const user = await this.prisma.users.findUnique({ where: { email } });
        if (!user || passwordHash !== user.password_hash) {
            logger.warn({ email }, "Invalid credentials");
            throw new InvalidCredentialsError();
        }

        switch (user.status) {
            case 'locked':
                logger.warn({ email }, "Account is locked");
                throw new AccountLockedError();
            case 'pending':
                logger.warn({ email }, "Account is pending approval");
                throw new AccountPendingError();
        }

        logger.info({ userId: user.id }, "User authenticated successfully");
        return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
        };
    }

    async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
        logger.info({ userId }, "Updating user password");
        await this.checkRootAdminAndExistedId(userId);
        await this.prisma.users.update({
            where: { id: userId },
            data: { password_hash: newPasswordHash },
        });
        logger.info({ userId }, "Password updated successfully");
    }

    async updateLastLogin(userId: string, at?: Date): Promise<void> {
        logger.debug({ userId }, "Updating last login timestamp");
        await this.checkRootAdminAndExistedId(userId);
        const now = at ?? new Date();
        await this.prisma.users.update({
            where: { id: userId },
            data: { last_login: now },
        });
        logger.debug({ userId }, "Last login updated");
    }


    // Public View
    async fetchPublicProfile(userId: string): Promise<PublicUserProfile> {
        logger.debug({ userId }, "Fetching public profile");
        await this.checkRootAdminAndExistedId(userId);
        const user = await this.prisma.users.findUnique({
            where: {
                id: userId,
                status: { notIn: ['deleted', 'locked'] },
            },
            select: {
                id: true,
                username: true,
                avatar_url: true,
                role: true,
            },
        });

        if (!user) {
            logger.warn({ userId }, "Public profile not found");
            throw new UserNotFoundError(userId);
        }

        logger.debug({ userId }, "Public profile fetched successfully");
        return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar_url,
            role: user.role,
        };
    }

    async searchPublicProfilesByDisplayName(username: string): Promise<PublicUserProfile[] | null> {
        const users = await this.prisma.users.findMany({
            where: {
                username: {
                    contains: username,
                    mode: 'insensitive',
                },
                status: { notIn: ['locked', 'deleted'] },
            },
            select: {
                id: true,
                username: true,
                avatar_url: true,
                role: true,
            },
        });

        return users.map(user => ({
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar_url,
            role: user.role,
        }));
    }

    // Admin view
    async fetchAdminUserView(userId: string): Promise<AdminUserView | null> {
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

    async listUsers( // failed. too hard. will implement later
        filter?: ListUserFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<AdminUserView>> {
        logger.info({ filter, pagination, sort }, "Listing users (admin view)");
        // Build WHERE clause dynamically
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
            conditions.push(`(LOWER(username) LIKE LOWER($${idx}) OR LOWER(email) LIKE LOWER($${idx}))`);
            params.push(`%${filter.search}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        console.log("where clause: " + whereClause);

        // Order clause
        const orderBy = sort ? `${sort.field} ${sort.order.toUpperCase()}` : 'created_at DESC';

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;
        logger.debug({ whereClause, orderBy, page, limit }, "Executing user list query");

        // Total count
        const total = await this.count(filter);

        // Fetch items
        console.log(`SELECT id, username, email, avatar_url, status, role, created_at, last_login
            FROM users 
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};,
            ${params}`
        );

        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<{
            id: string;
            username: string;
            email: string;
            avatar_url: string | null;
            status: string;
            role: string;
            created_at: Date;
            last_login: Date | null;
        }[]>(`
            SELECT id, username, email, avatar_url, status, role, created_at, last_login
            FROM users 
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};`,
            ...params
        );

        //Map to DTO
        const items: AdminUserView[] = itemsRaw.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            avatarUrl: u.avatar_url,
            status: u.status,
            role: u.role,
            createdAt: u.created_at,
            lastLogin: u.last_login ?? undefined,
        }));

        return { items, total, page, limit };
    }

    async setUserLock(id: string, locked: boolean): Promise<void> {
        await this.checkRootAdminAndExistedId(id);
        await this.prisma.users.update({
            where: { id },
            data: { status: locked ? UserStatus.Locked : UserStatus.Active },
        });
    }

    async count(filter?: ListUserFilterDto): Promise<number> {
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
            conditions.push(`(LOWER(username) LIKE LOWER($${idx}) OR LOWER(email) LIKE LOWER($${idx}))`);
            params.push(`%${filter.search}%`);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        console.log("where clause: " + whereClause);

        // Total count
        const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
            `SELECT COUNT(*) as count FROM "users" ${whereClause};`,
            ...params
        );

        return Number(result[0]?.count ?? 0);
    }

    private async checkRootAdminAndExistedId(id: string) {
        if (!isUuid(id)) {
            throw new UserNotFoundError(id);
        }

        if (id === ROOT_ADMIN_ID) {
            logger.error({ id }, "Attempted modification of root admin");
            throw new CannotModifyRootAdminError();
        }

        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) {
            logger.warn({ id }, "User not found");
            throw new UserNotFoundError(id);
        }
    }

    private async insert(user: CreateVolunteerDto): Promise<string> {
        logger.debug({ email: user.email }, "Checking if email already exists");
        const existing = await this.prisma.users.findUnique({ where: { email: user.email } });
        if (existing) {
            logger.warn({ email: user.email }, "Duplicate email detected");
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

        logger.info({ userId: newUser.id }, "Inserted new user record");
        return newUser.id;
    }

    private async findParticipatedEventIds(userId: string): Promise<string[]> {
        logger.trace({ userId }, "Fetching participated event IDs");
        const result = await this.prisma.registrations.findMany({
            where: {
                user_id: userId,
                status: 'approved',
            },
            select: { event_id: true },
        });
        return result.map((r: { event_id: string }) => r.event_id);
    }

    private async findRegisteredEventIds(userId: string): Promise<string[]> {
        logger.trace({ userId }, "Fetching registered event IDs");
        const result = await this.prisma.registrations.findMany({
            where: { user_id: userId },
            select: { event_id: true },
        });
        return result.map((r: { event_id: string }) => r.event_id);
    }

    private async findNotificationIds(userId: string): Promise<string[]> {
        logger.trace({ userId }, "Fetching notification IDs");
        const result = await this.prisma.notifications.findMany({
            where: { user_id: userId },
            select: { id: true },
        });
        return result.map((r: { id: string }) => r.id);
    }

    private async findPostIds(userId: string): Promise<string[]> {
        logger.trace({ userId }, "Fetching post IDs");
        const result = await this.prisma.posts.findMany({
            where: { author_id: userId },
            select: { id: true },
        });
        return result.map((r: { id: string }) => r.id);
    }


    private toDomain(prismaUser: PrismaUser & {
        participatedEventIds?: string[];
        registeredEventIds?: string[];
        notificationIds?: string[];
        postIds?: string[];
    }): User {
        logger.trace({ id: prismaUser.id }, "Mapping PrismaUser to domain User");
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
