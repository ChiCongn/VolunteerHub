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
import { EventStatus } from '../../domain/entities/enums';
import { EventRepository } from './event.repository';

export class PostRepository implements IPostRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly eventRepo: EventRepository
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
        await this.eventRepo.checkExistedAndApprovedEvent(eventId);

        // Order clause
        const orderBy = sort ? `${sort.field} ${sort.order.toUpperCase()}` : "start_time DESC";

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

    }

    async findByAuthor(
        authorId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {

    }

    // Search by keyword
    async search(
        eventId: string,
        keyword: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PostView>> {

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

    private checkExistence(id: string): void {
        logger.info(`Checking existence of post with id ${id}`);
        const post = this.prisma.posts.findUnique({ where: { id } });
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
