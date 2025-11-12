import { IPostRepository } from '../../domain/repositories/post.irepository';
import { PrismaClient, posts as PrismaPost } from '../prisma/generated/client';
import { Post } from '../../domain/entities/post.entity';
import {
    CreatePostDto,
    UpdatePostDto,
    PostView
} from '../../application/dtos/post.dto';
import {
    PostNotFoundError,
    NotPostAuthorError,
    PostInUnapprovedEventError,
    ReactionAlreadyExistsError
} from '../../domain/errors/post.error';
import { Pagination } from '../../application/dtos/pagination.dto';
import { SortOption } from '../../application/dtos/sort-option.dto';
import { ListResult } from '../../application/dtos/list-result.dto';
import logger from '../../logger';
import { EventStatus, UserStatus } from '../../domain/entities/enums';
import { EventRepository } from './event.repository';
import { UserRepository } from './user.repository';

export class PostRepository implements IPostRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly eventRepo: EventRepository,
        private readonly userRepo: UserRepository
    ) { }

    // Core CRUD
    async create(post: CreatePostDto): Promise<Post> {
        const postId = await this.insert(post);
        return this.findById(postId);
    }
    async findById(id: string): Promise<Post> {
        logger.info(`Finding post by id: ${id}`);
        const postPrisma = await this.prisma.posts.findUnique({ where: { id } });
        if (!postPrisma) {
            logger.warn(`Post with id ${id} not found`);
            throw new PostNotFoundError(id);
        }
        return await this.toDomain(postPrisma);
    }
    async update(id: string, changes: UpdatePostDto): Promise<Post> {
        logger.info(`Updating post with id: ${id}`);
        await this.checkExistence(id);
        await this.prisma.posts.update({
            where: { id },
            data: {
                ...(changes.content && { content: changes.content }),
                ...(changes.imageUrl && { image_url: changes.imageUrl }),
            },
        });
        logger.debug(`Post with id ${id} updated successfully`);
        return this.findById(id);
    }
    async softDelete(id: string): Promise<void> {
        logger.info(`Soft deleting post with id: ${id}`);
        await this.checkExistence(id);
        await this.prisma.posts.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
        logger.debug(`Post with id ${id} soft deleted`);
    }

    async restore(id: string): Promise<void> {
        logger.info(`Restoring post with id: ${id}`);
        await this.checkExistence(id);
        await this.prisma.posts.update({
            where: { id },
            data: { deleted_at: null },
        });
        logger.debug(`Post with id ${id} restored`);
    }

    // Public view
    async findByEventId(
        eventId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        logger.info(`Finding posts by eventId: ${eventId}`);
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        // Order clause
        const sortableFields = new Set([
            "created_at",
            "author_id",
        ]);
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
            FROM events
            WHERE event_id = $1 AND deleted_at IS NULL
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

        logger.debug(`Found ${items.length} posts for eventId: ${eventId}`);
        return {items, total, page, limit};
    }

    async findByAuthor(
        authorId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        logger.info(`Finding posts by authorId: ${authorId}`);
        const user = await this.userRepo.findById(authorId);
        if (!user || user.status === UserStatus.Deleted || user.status === UserStatus.Pending) {
            logger.warn(`Author with id ${authorId} is not found or deactivated`);
            throw new PostNotFoundError(`Author with id ${authorId} is is not existed or deactivated`);
        }
        // Order clause
        const sortableFields = new Set([
            "created_at",
            "event_id",
        ]);
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
            FROM events
            WHERE author_id = $1 AND deleted_at IS NULL
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

        logger.debug(`Found ${items.length} posts by authorId: ${authorId}`);
        return {items, total, page, limit}; 

    }

    // Search by keyword
    async search(
        eventId: string,
        keyword: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {
        logger.info(`Searching posts by eventId: ${eventId} with keyword: ${keyword}`);
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        // Order clause
        const sortableFields = new Set([
            "created_at",
            "author_id",
        ]);
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
                content: { contains: keyword },
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
            FROM events
            WHERE event_id = $1 AND content ILIKE '%' || $2 || '%' AND deleted_at IS NULL
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

        logger.debug(`Search found ${items.length} posts for eventId ${eventId} with keyword "${keyword}"`);
        return {items, total, page, limit};
    }

    // Stats
    async countByEventId(eventId: string): Promise<number> {
        logger.info(`Counting posts for eventId: ${eventId}`);
        return this.prisma.posts.count({
            where: {
                event_id: eventId,
                deleted_at: null,
            },
        });
    }
    async countByUserId(userId: string): Promise<number> {
        logger.info(`Counting posts for userId: ${userId}`);
        return this.prisma.posts.count({
            where: {
                author_id: userId,
                deleted_at: null,
            },
        });
    }

    private async insert(post: CreatePostDto): Promise<string> {
        logger.info(`Inserting new post for event ${post.eventId} by author ${post.authorId}`);
        await this.checkEventApproval(post.eventId);
        const postPrisma = await this.prisma.posts.create({
            data: {
                event_id: post.eventId,
                author_id: post.authorId,
                content: post.content,
                image_url: post.imageUrl,
            },
            select: { id: true }
        });
        return postPrisma.id;
    }

    private async checkExistence(id: string): Promise<void> {
        logger.info(`Checking existence of post with id ${id}`);
        const post = await this.prisma.posts.findUnique({ where: { id } });
        if (!post) {
            logger.warn(`Post with id ${id} not found`);
            throw new PostNotFoundError(id);
        }
    }

    private async checkAuthor(postId: string, userId: string): Promise<void> {
        logger.info(`Checking if user ${userId} is author of post ${postId}`);
        const post = await this.prisma.posts.findUnique({ where: { id: postId } });
        if (post?.author_id !== userId) {
            logger.warn(`User ${userId} is not author of post ${postId}`);
            throw new NotPostAuthorError(postId, userId);
        }
    }

    private async checkEventApproval(eventId: string): Promise<void> {
        logger.info(`Checking if event ${eventId} is approved`);
        const event = await this.prisma.events.findUnique({ where: { id: eventId } });
        if (!event || event.status === EventStatus.Pending || event.status === EventStatus.Rejected) {
            logger.warn(`Event ${eventId} is not approved`);
            throw new PostInUnapprovedEventError(eventId);
        }
    }

    private async checkReactionExists(postId: string, userId: string): Promise<void> {
        logger.info(`Checking if user ${userId} has already reacted to post ${postId}`);
        const reaction = await this.prisma.reactions.findFirst({
            where: {
                post_id: postId,
                user_id: userId
            }
        });
        if (reaction) {
            logger.warn(`User ${userId} has already reacted to post ${postId}`);
            throw new ReactionAlreadyExistsError(postId, userId);
        }
    }

    private toDomain(postPrisma: PrismaPost): Post {
        logger.info(`Mapping Prisma post to domain post for post id ${postPrisma.id}`);
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
