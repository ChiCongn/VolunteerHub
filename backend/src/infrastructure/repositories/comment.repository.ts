import { CommentView, CreateCommentDto, UpdateCommentDto } from "../../application/dtos/comment.dto";
import { ICommentRepository } from "../../domain/repositories/comment.irepository";
import { Comment } from "../../domain/entities/comment.entity";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { PrismaClient, comments as PrismaComment } from "../prisma/generated/client";
import {
    CommentNotFoundError,
    InvalidCommentContentError
} from "../../domain/errors/comment.error";
import { UserRepository } from "./user.repository";
import logger from "../../logger";
import { PostRepository } from "./post.repository";
import { asyncWrapProviders } from "async_hooks";

export class CommentRepository implements ICommentRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly userRepository: UserRepository,
        private readonly postRepo: PostRepository
    ) { }

    // Core CRUD
    async create(comment: CreateCommentDto): Promise<Comment> {
        logger.info(`Created comment for postId: ${comment.postId} by authorId: ${comment.authorId}`);
        const commentId = await this.insert(comment);
        return this.findById(commentId);
    }
    async findById(id: string): Promise<Comment> {
        logger.info(`Finding comment by id: ${id}`);
        const prismaComment = await this.prisma.comments.findUnique({ where: { id } });
        if (!prismaComment) {
            logger.warn(`Comment with id: ${id} not found`);
            throw new CommentNotFoundError(id);
        }
        return this.toDomain(prismaComment);
    }
    async update(id: string, changes: UpdateCommentDto): Promise<Comment> {
        logger.info(`Updating comment with id: ${id}`);
        await this.checkExistence(id);
        await this.prisma.comments.update({
            where: { id },
            data: {
                content: changes.content,
            },
        });
        return this.findById(id);
    }
    async delete(id: string): Promise<void> {
        logger.info(`Deleting comment with id: ${id}`);
        await this.checkExistence(id);
        await this.prisma.comments.delete({ where: { id } });
    }

    // Public view
    async findByPostId(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<CommentView>> {
        logger.info(`Finding comments for postId: ${postId} with pagination: ${JSON.stringify(pagination)} and sort: ${JSON.stringify(sort)}`);
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

        const total = await this.countByPostId(postId);

        const prismaComments = await this.prisma.$queryRaw<PrismaComment[]>`
            SELECT *
            FROM comments
            WHERE post_id = ${postId}::uuid
            ORDER BY ${orderBy}
            LIMIT ${limit} 
            OFFSET ${offset};
        `;

        const items: CommentView[] = [];
        for (const prismaComment of prismaComments) {
            const domainComment = this.toDomain(prismaComment);
            const commentView = await this.toView(domainComment);
            items.push(commentView);
        }
        return { items, total, page, limit };
    }

    async countByPostId(postId: string): Promise<number> {
        logger.info(`Counting comments for postId: ${postId}`);
        const count = await this.prisma.comments.count({ where: { post_id: postId } });
        return count;
    }

    async checkExistence(id: string): Promise<void> {
        logger.info(`Checking existence of comment with id: ${id}`);
        const comment = await this.prisma.comments.findUnique({ where: { id } });

        if (!comment) {
            logger.warn(`Comment with id: ${id} not found`);
            throw new CommentNotFoundError(id);
        }
    }

    private async insert(comment: CreateCommentDto): Promise<string> {
        logger.info(`Inserting new comment: ${JSON.stringify(comment)}`);
        await this.postRepo.checkExistence(comment.postId);
        const prismaComment = await this.prisma.comments.create({
            data: {
                post_id: comment.postId,
                author_id: comment.authorId,
                content: comment.content,
            },
        });
        return prismaComment.id;
    }

    private toDomain(prismaComment: PrismaComment): Comment {
        logger.debug(`Mapping Prisma comment to domain Comment entity: ${JSON.stringify(prismaComment)}`);
        const comment =  new Comment({
            id: prismaComment.id,
            postId: prismaComment.post_id,
            authorId: prismaComment.author_id,
            content: prismaComment.content,
            createdAt: prismaComment.created_at,
        });
        return comment;
    }

    private async toView(comment: Comment): Promise<CommentView> {
        logger.debug(`Mapping to CommentView: ${JSON.stringify(comment)}`);
        const author = await this.userRepository.fetchPublicProfile(comment.authorId);
        return {
            id: comment.id,
            author: author,
            content: comment.content,
            createdAt: comment.createdAt,
        };

    }
}