import { IPostRepository } from "../../domain/repositories/post.irepository";
import { PrismaClient, posts as PrismaPost } from "../prisma/generated/client";
import { Post } from "../../domain/entities/post.entity";
import {
    CreatePostDto,
    UpdatePostDto,
    PostView,
    PostAuthInfoDto,
} from "../../application/dtos/post.dto";
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
    async create(post: CreatePostDto): Promise<PostView> {
        logger.debug(
            { authorId: post.authorId, eventId: post.eventId, action: "create post" },
            "[PostRepository] Creating new post on event"
        );

        const newPost = await this.prisma.posts.create({
            data: {
                author_id: post.authorId,
                event_id: post.eventId,
                content: post.content,
                image_url: post.imageUrl,
            },
            include: {
                users: true,
                events: true,
            },
        });

        return {
            id: newPost.id,
            content: newPost.content,
            imageUrl: newPost.image_url || "",
            createdAt: newPost.created_at,
            author: {
                id: newPost.users.id,
                username: newPost.users.username,
                avatarUrl: newPost.users.avatar_url || "",
                role: newPost.users.role,
            },
            event: {
                id: newPost.events.id,
                name: newPost.events.name,
            },
            reactionCount: 0,
            commentCount: 0,
        };
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
        pagination: Pagination,
        sort: SortOption
    ): Promise<ListResult<PostView>> {
        logger.debug(
            { eventId, pagination, sort, action: "list posts by event" },
            "[PostRepository] Finding posts by eventId"
        );

        // Pagination
        const offset = (pagination.page - 1) * pagination.limit;
        const orderBy = `${sort.field} ${sort.order}`;

        // Total count
        const total = await this.countByEventId(eventId);

        // Fetch items
        const itemsRaw = await this.prisma.$queryRawUnsafe<
            {
                post_id: string;
                post_content: string;
                post_image_url: string | null;
                post_created_at: Date;

                event_id: string;
                event_name: string;

                author_id: string;
                author_username: string;
                author_avatar_url: string | null;
                author_role: UserRole;

                reaction_count: number;
                comment_count: number;
            }[]
        >(
            `
            SELECT
                p.id            AS post_id,
                p.content       AS post_content,
                p.image_url     AS post_image_url,
                p.created_at    AS post_created_at,

                e.id            AS event_id,
                e.name          AS event_name,

                u.id            AS author_id,
                u.username      AS author_username,
                u.avatar_url    AS author_avatar_url,
                u.role          AS author_role,

                -- Count unique user_id/post_id pairs from reactions
                COUNT(DISTINCT r.user_id)::int AS reaction_count,
                -- Count unique comment IDs
                COUNT(DISTINCT c.id)::int      AS comment_count
            FROM posts p
            JOIN events e ON e.id = p.event_id
            JOIN users  u ON u.id = p.author_id
            LEFT JOIN reactions r ON r.post_id = p.id
            LEFT JOIN comments  c ON c.post_id = p.id
            WHERE p.event_id = $1::uuid
                AND p.deleted_at IS NULL
            GROUP BY p.id, e.id, u.id
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${pagination.limit};
            `,
            eventId
        );

        const items: PostView[] = itemsRaw.map((r) => ({
            id: r.post_id,
            content: r.post_content,
            imageUrl: r.post_image_url ?? "",
            createdAt: r.post_created_at,
            reactionCount: r.reaction_count,
            commentCount: r.comment_count,

            event: {
                id: r.event_id,
                name: r.event_name,
            },

            author: {
                id: r.author_id,
                username: r.author_username,
                avatarUrl: r.author_avatar_url ?? "",
                role: r.author_role,
            },
        }));

        return { items, total, page: pagination.page, limit: pagination.limit };
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

                event_id: string;
                event_name: string;

                reaction_count: number;
                comment_count: number;
            }[]
        >(
            `
            SELECT
                p.id,
                p.content,
                p.image_url,
                p.created_at,

                u.id          AS author_id,
                u.username,
                u.avatar_url,
                u.role,

                e.id          AS event_id,
                e.name        AS event_name,

                -- Distinct counts to prevent multiplier effect from joins
                COUNT(DISTINCT react.user_id)::int AS reaction_count,
                COUNT(DISTINCT c.id)::int          AS comment_count
            FROM posts p
            JOIN events e 
                ON e.id = p.event_id
            JOIN registrations reg 
                ON reg.event_id = p.event_id
            JOIN users u 
                ON u.id = p.author_id
            LEFT JOIN reactions react 
                ON react.post_id = p.id
            LEFT JOIN comments c 
                ON c.post_id = p.id
            WHERE reg.user_id = $1::uuid
                AND reg.status = 'approved'
                AND p.deleted_at IS NULL
            GROUP BY 
                p.id, p.content, p.image_url, p.created_at,
                u.id, u.username, u.avatar_url, u.role,
                e.id, e.name
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
            createdAt: row.created_at,
            reactionCount: row.reaction_count,
            commentCount: row.comment_count,
            author: {
                id: row.author_id,
                username: row.username,
                avatarUrl: row.avatar_url ?? "",
                role: row.role as UserRole,
            },
            event: {
                id: row.event_id,
                name: row.event_name,
            },
        }));
    }

    async findByAuthor(
        authorId: string,
        pagination: Pagination,
        sort: SortOption
    ): Promise<ListResult<PostView>> {
        logger.debug(
            { authorId, pagination, sort, action: "list posts by author" },
            "[PostRepository] Finding posts by authorId"
        );

        // Pagination
        const offset = (pagination.page - 1) * pagination.limit;
        const orderBy = `${sort.field} ${sort.order}`;

        // Total count
        const total = await this.countByUserId(authorId);

        // Fetch items
        const itemsRaw = await this.prisma.$queryRawUnsafe<
            {
                post_id: string;
                post_content: string;
                post_image_url: string | null;
                post_created_at: Date;

                event_id: string;
                event_name: string;

                author_id: string;
                author_username: string;
                author_avatar_url: string | null;
                author_role: UserRole;

                reaction_count: number;
                comment_count: number;
            }[]
        >(
            `
            SELECT
                p.id            AS post_id,
                p.content       AS post_content,
                p.image_url     AS post_image_url,
                p.created_at    AS post_created_at,

                e.id            AS event_id,
                e.name          AS event_name,

                u.id            AS author_id,
                u.username      AS author_username,
                u.avatar_url    AS author_avatar_url,
                u.role          AS author_role,

                COUNT(DISTINCT r.user_id)::int AS reaction_count,
                COUNT(DISTINCT c.id)::int      AS comment_count
            FROM posts p
            JOIN events e ON e.id = p.event_id
            JOIN users  u ON u.id = p.author_id
            LEFT JOIN reactions r ON r.post_id = p.id
            LEFT JOIN comments  c ON c.post_id = p.id
            WHERE p.author_id = $1::uuid
                AND p.deleted_at IS NULL
            GROUP BY p.id, e.id, u.id
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${pagination.limit};
            `,
            authorId
        );

        const items: PostView[] = itemsRaw.map((r) => ({
            id: r.post_id,
            content: r.post_content,
            imageUrl: r.post_image_url ?? "",
            createdAt: r.post_created_at,
            reactionCount: r.reaction_count,
            commentCount: r.comment_count,

            event: {
                id: r.event_id,
                name: r.event_name,
            },

            author: {
                id: r.author_id,
                username: r.author_username,
                avatarUrl: r.author_avatar_url ?? "",
                role: r.author_role,
            },
        }));

        return { items, total, page: pagination.page, limit: pagination.limit };
    }

    // Search by keyword
    async search(
        eventId: string,
        keyword: string,
        pagination: Pagination,
        sort: SortOption
    ): Promise<ListResult<PostView>> {
        logger.debug(
            { eventId, keyword, pagination, sort, action: "search posts" },
            "[PostRepository] Searching posts by keyword"
        );

        // Total count
        const total = await this.prisma.posts.count({
            where: {
                event_id: eventId,
                content: { contains: keyword, mode: "insensitive" },
                deleted_at: null,
            },
        });

        // Pagination
        const offset = (pagination.page - 1) * pagination.limit;
        const orderBy = `${sort.field} ${sort.order}`;

        // Fetch items
        const itemsRaw = await this.prisma.$queryRawUnsafe<
            {
                post_id: string;
                post_content: string;
                post_image_url: string | null;
                post_created_at: Date;

                event_id: string;
                event_name: string;

                author_id: string;
                author_username: string;
                author_avatar_url: string | null;
                author_role: UserRole;

                reaction_count: number;
                comment_count: number;
            }[]
        >(
            `
            SELECT
                p.id            AS post_id,
                p.content       AS post_content,
                p.image_url     AS post_image_url,
                p.created_at    AS post_created_at,

                e.id            AS event_id,
                e.name          AS event_name,

                u.id            AS author_id,
                u.username      AS author_username,
                u.avatar_url    AS author_avatar_url,
                u.role          AS author_role,

                COUNT(DISTINCT r.user_id)::int AS reaction_count,
                COUNT(DISTINCT c.id)::int      AS comment_count
            FROM posts p
            JOIN events e ON e.id = p.event_id
            JOIN users  u ON u.id = p.author_id
            LEFT JOIN reactions r ON r.post_id = p.id
            LEFT JOIN comments  c ON c.post_id = p.id
            WHERE p.event_id = $1::uuid
                AND p.deleted_at IS NULL
                AND p.content ILIKE '%' || $2 || '%'
            GROUP BY p.id, e.id, u.id
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${pagination.limit};
            `,
            eventId,
            keyword
        );

        const items: PostView[] = itemsRaw.map((r) => ({
            id: r.post_id,
            content: r.post_content,
            imageUrl: r.post_image_url ?? "",
            createdAt: r.post_created_at,

            reactionCount: r.reaction_count,
            commentCount: r.comment_count,

            event: {
                id: r.event_id,
                name: r.event_name,
            },

            author: {
                id: r.author_id,
                username: r.author_username,
                avatarUrl: r.author_avatar_url ?? "",
                role: r.author_role,
            },
        }));

        return { items, total, page: pagination.page, limit: pagination.limit };
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

    async getPostAuthInfo(postId: string): Promise<PostAuthInfoDto> {
        logger.warn(
            { postId, action: "getPostAuthInfo" },
            "[PostRepository] Fetching post auth info"
        );
        const post = await this.prisma.posts.findUnique({
            where: { id: postId },
            select: {
                author_id: true,
                events: {
                    select: {
                        owner_id: true,
                        event_manager_ids: true,
                    },
                },
            },
        });

        if (!post) {
            throw new PostNotFoundError(postId);
        }

        return {
            authorId: post.author_id,
            eventOwnerId: post.events.owner_id,
            eventManagerIds: post.events.event_manager_ids,
        };
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
