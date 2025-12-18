import { IPostRepository } from "../../domain/repositories/post.irepository";
import { PrismaClient, posts as PrismaPost } from "../prisma/generated/client";
import { Post } from "../../domain/entities/post.entity";
import { CreatePostDto, UpdatePostDto, PostView } from "../../application/dtos/post.dto";
import {
    PostNotFoundError,
    NotPostAuthorError,
    PostInUnapprovedEventError,
    ReactionAlreadyExistsError,
} from "../../domain/errors/post.error";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import logger from "../../logger";
import { EventStatus, UserRole, UserStatus } from "../../domain/entities/enums";
import { EventRepository } from "./event.repository";
import { UserRepository } from "./user.repository";

export class PostRepository implements IPostRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly eventRepo: EventRepository,
        private readonly userRepo: UserRepository
    ) {}

    // Core CRUD
    async create(post: CreatePostDto): Promise<Post> {
        logger.debug(
            {
                authorId: post.authorId,
                eventId: post.eventId,
                action: "create post",
            },
            "[PostRepository] Creating new post on event"
        );

        const postId = await this.insert(post);
        return this.findById(postId);
    }
    async findById(id: string): Promise<Post> {
        logger.debug(
            {
                postId: id,
                action: "find post by id",
            },
            "[PostRepository] Finding post by id"
        );

        const postPrisma = await this.prisma.posts.findUnique({ where: { id } });
        if (!postPrisma) {
            logger.warn(
                {
                    postId: id,
                    action: "find post by id",
                },
                "[PostRepository] Post not found"
            );

            throw new PostNotFoundError(id);
        }
        return await this.toDomain(postPrisma);
    }
    async update(id: string, changes: UpdatePostDto): Promise<Post> {
        logger.debug(
            {
                postId: id,
                changes,
                action: "update post",
            },
            "[PostRepository] Updating post"
        );

        await this.checkExistence(id);
        await this.prisma.posts.update({
            where: { id },
            data: {
                ...(changes.content && { content: changes.content }),
                ...(changes.imageUrl && { image_url: changes.imageUrl }),
            },
        });
        return this.findById(id);
    }
    async softDelete(id: string): Promise<void> {
        logger.debug(
            {
                postId: id,
                action: "soft delete post",
            },
            "[PostRepository] Soft deleting post"
        );
        await this.checkExistence(id);
        await this.prisma.posts.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }

    async restore(id: string): Promise<void> {
        logger.debug(
            { postId: id, action: "restore post" },
            "[PostRepository] Restoring soft-deleted post"
        );
        await this.checkExistence(id);
        await this.prisma.posts.update({
            where: { id },
            data: { deleted_at: null },
        });
    }

    // Public view
    async findByEventId(
        eventId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        logger.debug(
            { eventId, pagination, sort, action: "list posts by event" },
            "[PostRepository] Finding posts by eventId"
        );
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        // Order clause
        const sortableFields = new Set(["created_at", "author_id"]);
        let orderBy: string;

        if (sort && sortableFields.has(sort.field)) {
            const order = sort.order?.toLowerCase() === "asc" ? "ASC" : "DESC";
            orderBy = `${sort.field} ${order}`;
        } else {
            orderBy = "created_at DESC";
        }

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

        // Total count
        const total = await this.countByEventId(eventId);

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<
            {
                id: string;
                event_id: string;
                author_id: string;
                content: string;
                image_url: string | null;
                created_at: Date;
            }[]
        >(
            `
            SELECT id, event_id, author_id, content, image_url, created_at
            FROM posts
            WHERE event_id = $1::uuid AND deleted_at IS NULL
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};`,
            eventId
        );
        const items: PostView[] = [];
        for (const itemRaw of itemsRaw) {
            const authorProfile = await this.userRepo.fetchPublicProfile(itemRaw.author_id);
            items.push({
                id: itemRaw.id,
                author: authorProfile,
                content: itemRaw.content,
                imageUrl: itemRaw.image_url ?? undefined,
                createddAt: itemRaw.created_at,
            });
        }

        return { items, total, page, limit };
    }

    async findFeedByUser(userId: string, limit = 20): Promise<PostView[]> {
        logger.debug({ userId, limit }, "[PostRepository] Finding feed for user");

        const rows = await this.prisma.$queryRawUnsafe<
            {
                id: string;
                content: string;
                image_url: string | null;
                created_at: Date;
                author_id: string;
                username: string;
                avatar_url: string | null;
                role: string;
            }[]
        >(
            `
            SELECT
                p.id,
                p.content,
                p.image_url,
                p.created_at,

                u.id AS author_id,
                u.username,
                u.avatar_url,
                u.role
            FROM posts p
            JOIN registrations r
            ON r.event_id = p.event_id
            JOIN users u
            ON u.id = p.author_id
            WHERE r.user_id = $1::uuid
            AND r.status = 'approved'
            AND p.deleted_at IS NULL
            ORDER BY p.created_at DESC
            LIMIT $2;
            `,
            userId,
            limit
        );

        return rows.map((row) => ({
            id: row.id,
            content: row.content,
            imageUrl: row.image_url ?? "",
            createddAt: row.created_at,
            author: {
                id: row.author_id,
                username: row.username,
                avatarUrl: row.avatar_url ?? "",
                role: row.role as UserRole,
            },
        }));
    }

    async findByAuthor(
        authorId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        logger.debug(
            { authorId, pagination, sort, action: "list posts by author" },
            "[PostRepository] Finding posts by authorId"
        );
        const user = await this.userRepo.findById(authorId);
        if (!user || user.status === UserStatus.Deleted || user.status === UserStatus.Pending) {
            logger.warn(`Author with id ${authorId} is not found or deactivated`);
            throw new PostNotFoundError(
                `Author with id ${authorId} is is not existed or deactivated`
            );
        }
        // Order clause
        const sortableFields = new Set(["created_at", "event_id"]);
        let orderBy: string;

        if (sort && sortableFields.has(sort.field)) {
            const order = sort.order?.toLowerCase() === "asc" ? "ASC" : "DESC";
            orderBy = `${sort.field} ${order}`;
        } else {
            orderBy = "created_at DESC";
        }

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

        // Total count
        const total = await this.countByUserId(authorId);

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<
            {
                id: string;
                event_id: string;
                author_id: string;
                content: string;
                image_url: string | null;
                created_at: Date;
            }[]
        >(
            `
            SELECT id, event_id, author_id, content, image_url, created_at
            FROM posts
            WHERE author_id = $1::uuid AND deleted_at IS NULL
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};`,
            authorId
        );
        const items: PostView[] = [];
        for (const itemRaw of itemsRaw) {
            const authorProfile = await this.userRepo.fetchPublicProfile(itemRaw.author_id);
            items.push({
                id: itemRaw.id,
                author: authorProfile,
                content: itemRaw.content,
                imageUrl: itemRaw.image_url ?? undefined,
                createddAt: itemRaw.created_at,
            });
        }

        return { items, total, page, limit };
    }

    // Search by keyword
    async search(
        eventId: string,
        keyword: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        logger.debug(
            { eventId, keyword, pagination, sort, action: "search posts" },
            "[PostRepository] Searching posts by keyword"
        );
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        // Order clause
        const sortableFields = new Set(["created_at", "author_id"]);
        let orderBy: string;

        if (sort && sortableFields.has(sort.field)) {
            const order = sort.order?.toLowerCase() === "asc" ? "ASC" : "DESC";
            orderBy = `${sort.field} ${order}`;
        } else {
            orderBy = "created_at DESC";
        }

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

        // Total count
        const total = await this.prisma.posts.count({
            where: {
                event_id: eventId,
                content: { contains: keyword, mode: "insensitive" },
                deleted_at: null,
            },
        });

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<
            {
                id: string;
                event_id: string;
                author_id: string;
                content: string;
                image_url: string | null;
                created_at: Date;
            }[]
        >(
            `
            SELECT id, event_id, author_id, content, image_url, created_at
            FROM posts
            WHERE event_id = $1::uuid AND content ILIKE '%' || $2 || '%' AND deleted_at IS NULL
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};`,
            eventId,
            keyword
        );
        const items: PostView[] = [];
        for (const itemRaw of itemsRaw) {
            const authorProfile = await this.userRepo.fetchPublicProfile(itemRaw.author_id);
            items.push({
                id: itemRaw.id,
                author: authorProfile,
                content: itemRaw.content,
                imageUrl: itemRaw.image_url ?? undefined,
                createddAt: itemRaw.created_at,
            });
        }

        return { items, total, page, limit };
    }

    // Stats
    async countByEventId(eventId: string): Promise<number> {
        logger.debug(
            { eventId, action: "count posts by event" },
            "[PostRepository] Counting posts by eventId"
        );
        return this.prisma.posts.count({
            where: {
                event_id: eventId,
                deleted_at: null,
            },
        });
    }
    async countByUserId(userId: string): Promise<number> {
        logger.debug(
            { userId, action: "count posts by user id" },
            "[PostRepository] Counting posts by userId"
        );
        return this.prisma.posts.count({
            where: {
                author_id: userId,
                deleted_at: null,
            },
        });
    }

    // utils
    async findAuthorId(postId: string): Promise<string> {
        logger.debug(
            { postId, action: "findAuthorId" },
            "[PostService] Fetching author id of this post"
        );

        const result = await this.prisma.posts.findUnique({
            where: { id: postId },
            select: { author_id: true },
        });

        if (!result) {
            logger.warn({ postId, action: "findAuthorId" }, "[PostService] Post not found");
            throw new PostNotFoundError(postId);
        }

        return result.author_id;
    }

    async findEventIdByPostId(postId: string): Promise<string> {
        logger.debug(
            { postId, action: "findEventIdByPostId" },
            "[PostService] Fetching event id that this post belong to"
        );

        const result = await this.prisma.posts.findUnique({
            where: { id: postId },
            select: { event_id: true },
        });

        if (!result) {
            logger.warn({ postId, action: "findEventIdByPostId" }, "[PostService] Post not found");
            throw new PostNotFoundError(postId);
        }

        return result.event_id;
    }

    private async insert(post: CreatePostDto): Promise<string> {
        logger.trace(
            { eventId: post.eventId, authorId: post.authorId, action: "insert post" },
            "[PostRepository] Inserting new post into DB"
        );
        await this.checkEventApproval(post.eventId);
        const postPrisma = await this.prisma.posts.create({
            data: {
                event_id: post.eventId,
                author_id: post.authorId,
                content: post.content,
                image_url: post.imageUrl,
            },
            select: { id: true },
        });
        return postPrisma.id;
    }

    async checkExistence(id: string): Promise<void> {
        logger.debug(
            { postId: id, action: "check post existence" },
            "[PostRepository] Checking post existence"
        );
        const post = await this.prisma.posts.findUnique({ where: { id } });
        if (!post) {
            logger.warn(
                { postId: id, action: "check post existence" },
                "[PostRepository] Post does not exist"
            );
            throw new PostNotFoundError(id);
        }
    }

    async checkAuthor(postId: string, userId: string): Promise<void> {
        logger.debug(
            { postId, userId, action: "verify post author" },
            "[PostRepository] Verifying post authorship"
        );
        const post = await this.prisma.posts.findUnique({ where: { id: postId } });
        if (post?.author_id !== userId) {
            logger.warn(
                { postId, userId, actualAuthor: post?.author_id, action: "verify post author" },
                "[PostRepository] User is not post author"
            );
            throw new NotPostAuthorError(postId, userId);
        }
    }

    async checkEventApproval(eventId: string): Promise<void> {
        logger.info(
            { eventId, action: "check event approval" },
            "[PostRepository] Checking event approval status"
        );
        const event = await this.prisma.events.findUnique({ where: { id: eventId } });
        if (
            !event ||
            event.status === EventStatus.Pending ||
            event.status === EventStatus.Rejected
        ) {
            logger.warn(
                { eventId, status: event?.status, action: "check event approval" },
                "[PostRepository] Event not approved"
            );
            throw new PostInUnapprovedEventError(eventId);
        }
    }

    async checkReactionExists(postId: string, userId: string): Promise<void> {
        logger.debug(
            { postId, userId, action: "check reaction exists" },
            "[PostRepository] Checking existing reaction"
        );
        const reaction = await this.prisma.reactions.findFirst({
            where: {
                post_id: postId,
                user_id: userId,
            },
        });
        if (reaction) {
            logger.warn(
                { postId, userId, action: "check reaction exists" },
                "[PostRepository] Reaction already exists"
            );
            throw new ReactionAlreadyExistsError(postId, userId);
        }
    }

    private toDomain(postPrisma: PrismaPost): Post {
        logger.debug(
            { postId: postPrisma.id, action: "map to domain" },
            "[PostRepository] Mapping Prisma → Domain"
        );
        return new Post({
            id: postPrisma.id,
            eventId: postPrisma.event_id,
            authorId: postPrisma.author_id,
            content: postPrisma.content,
            imageUrl: postPrisma.image_url ?? "",
            createdAt: postPrisma.created_at,
        });
    }
}
