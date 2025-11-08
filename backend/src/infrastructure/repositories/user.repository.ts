import { PrismaClient, users as PrismaUser } from "../prisma/generated/client";
import {
    CreateVolunteerDto,
    UpdateUserDto,
    ListUserFilterDto,
} from "../../application/dtos/user.dto";
import { IUserRepository } from "../../domain/repositories/user.irepositoty";
import { User } from "../../domain/entities/user.entity";
import {
    UserNotFoundError,
    CannotDeleteAlreadyDeletedUserError,
    CannotDeleteLockedUserError,
    CannotModifyRootAdminError,
} from "../../domain/errors/user.error";
import { EmailAlreadyExistsError } from "../../domain/errors/auth.error";
import { UserRole, UserStatus } from "../../domain/entities/enums";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";

const ROOT_ADMIN_ID = process.env.ROOT_ADMIN_ID;

export class UserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }

    async create(user: CreateVolunteerDto): Promise<User> {
        try {
            const userId = await this.insert(user);

            const createdUser = await this.findById(userId);

            return createdUser;
        } catch (err) {
            // Optional: wrap or rethrow domain errors if needed
            throw err;
        }
    }

    async findById(id: string): Promise<User> {
        const users = await this.prisma.$queryRawUnsafe<PrismaUser[]>(
            `SELECT * FROM users WHERE id = $1 LIMIT 1;`,
            id
        );

        if (users.length === 0) throw new UserNotFoundError(id);

        const user = users[0];

        // Domain rule checks
        if (user.status === UserStatus.Deleted) throw new CannotDeleteAlreadyDeletedUserError(id);
        if (user.status === UserStatus.Locked) throw new CannotDeleteLockedUserError(id);

        return this.toDomain(user);
    }

    async findByDisplayName(username: string): Promise<User[] | null> {
        const result = await this.prisma.$queryRawUnsafe<PrismaUser[]>(
            `SELECT id, name, email, role, status, avatar_url, last_login
            FROM users
            WHERE LOWER(name) LIKE LOWER($1)
            AND status = 'active'
            ORDER BY 
                CASE 
                    WHEN username ILIKE $2 THEN 0  -- exact prefix match first
                    WHEN username ILIKE $1 THEN 1  -- partial match
                    ELSE 2 
                END,
                name ASC
            LIMIT 20;`,
            `%${username}%`
        );
        return result.length ? result.map(this.toDomain) : null;
    }

    async listUsers(
        filter?: ListUserFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<User>> {
        const page = pagination?.page ?? 1;
        const limit = Math.min(pagination?.limit ?? 20, 100);
        const offset = (page - 1) * limit;

        let whereClause = "WHERE 1=1";
        const params: any[] = [];

        // ---- filters ----
        if (filter?.role) {
            params.push(filter.role);
            whereClause += ` AND role = $${params.length}`;
        }

        if (filter?.status) {
            params.push(filter.status);
            whereClause += ` AND status = $${params.length}`;
        }

        if (filter?.search) {
            params.push(`%${filter.search}%`);
            whereClause += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`;
        }

        // ---- sort ----
        const allowedSortFields = ["name", "email", "role", "status", "last_login", "updated_at"];
        const field = allowedSortFields.includes(sort?.field ?? "");
        const order = sort?.order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // ---- main query ----
        const query = `
        SELECT id, name, email, role, status, avatar_url, last_login, updated_at
        FROM users
        ${whereClause}
        ORDER BY "${field}" ${order}
        LIMIT ${limit} OFFSET ${offset};
    `;

        // ---- execute ----
        const users = await this.prisma.$queryRawUnsafe<User[]>(query, ...params);
        const total = await this.prisma.$queryRawUnsafe<number>(
            `SELECT COUNT(*) as count FROM users ${whereClause};`,
            ...params
        );

        return { items: users, total, page, limit };
    }

    async update(id: string, data: UpdateUserDto): Promise<User> {
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

        const updatedUser = await this.findById(id);
        return updatedUser;
    }


    async softDelete(id: string): Promise<void> {
        await this.checkRootAdminAndExistedId(id);

        await this.prisma.users.update({
            where: { id },
            data: {
                status: UserStatus.Deleted,
                updated_at: new Date(),
            },
        });
    }

    async setUserLock(id: string, locked: boolean): Promise<void> {
        await this.checkRootAdminAndExistedId(id);
        await this.prisma.users.update({
            where: { id },
            data: { status: locked ? UserStatus.Locked : UserStatus.Active },
        });
    }

    async count(filter?: ListUserFilterDto): Promise<number> {
        const whereClauses: string[] = [`"deletedAt" IS NULL`];
        const params: any[] = [];
        let paramIndex = 1;

        if (filter?.role) {
            whereClauses.push(`"role" = $${paramIndex++}`);
            params.push(filter.role);
        }
        if (filter?.status) {
            whereClauses.push(`"status" = $${paramIndex++}`);
            params.push(filter.status);
        }
        if (filter?.search) {
            whereClauses.push(
                `(LOWER("username") LIKE LOWER($${paramIndex}) OR LOWER("email") LIKE LOWER($${paramIndex}))`
            );
            params.push(`%${filter.search}%`);
            paramIndex++;
        }

        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
        const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
            `SELECT COUNT(*) as count FROM "User" ${whereSQL};`,
            ...params
        );

        return Number(result[0]?.count ?? 0);
    }

    private async checkRootAdminAndExistedId(id: string) {
        if (id === ROOT_ADMIN_ID) {
            throw new CannotModifyRootAdminError();
        }

        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new UserNotFoundError(id);
        }
    }

    private async insert(user: CreateVolunteerDto): Promise<string> {
        const existing = await this.prisma.users.findUnique({ where: { email: user.email } });
        if (existing) throw new EmailAlreadyExistsError(user.email);

        const newUser = await this.prisma.users.create({
            data: {
                name: user.username,
                email: user.email,
                password_hash: user.passwordHash,
                role: UserRole.Volunteer,
                status: UserStatus.Active,
            },
            select: { id: true },
        });
        return newUser.id;
    }

    private toDomain(prismaUser: PrismaUser): User {
        return new User({
            id: prismaUser.id,
            name: prismaUser.name,
            email: prismaUser.email,
            passwordHash: prismaUser.password_hash,
            avatarUrl: prismaUser.avatar_url,
            role: prismaUser.role as UserRole,
            status: prismaUser.status as UserStatus,
            lastLogin: prismaUser.last_login,
            updatedAt: prismaUser.updated_at,

            notificationIds: [],
            participatedEventIds: [],
            registeredEventIds: [],
            commentIds: [],
            postIds: [],
            reactionIds: [],
        });
    }
}
