import {
    CommentView,
    CreateCommentDto,
    UpdateCommentDto,
} from "../../application/dtos/comment.dto";
import { ICommentRepository } from "../../domain/repositories/comment.irepository";
import { Comment } from "../../domain/entities/comment.entity";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { PrismaClient, comments as PrismaComment } from "../prisma/generated/client";
import { CommentNotFoundError } from "../../domain/errors/comment.error";
import { UserRepository } from "./user.repository";
import logger from "../../logger";
import { PostRepository } from "./post.repository";

export class CommentRepository implements ICommentRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly userRepository: UserRepository,
        private readonly postRepo: PostRepository
    ) {}

    // Core CRUD
    async create(comment: CreateCommentDto): Promise<Comment> {
        logger.debug(
            { postId: comment.postId, authorId: comment.authorId, action: "create comment" },
            "[CommentRepository] Creating comment"
        );
        const commentId = await this.insert(comment);
        return this.findById(commentId);
    }
    async findById(id: string): Promise<Comment> {
        logger.debug(
            { commentId: id, action: "find comment by id" },
            "[CommentRepository] Finding comment by id"
        );
        const prismaComment = await this.prisma.comments.findUnique({ where: { id } });
        if (!prismaComment) {
            logger.warn(
                { commentId: id, action: "find comment by id" },
                "[CommentRepository] Comment not found"
            );
            throw new CommentNotFoundError(id);
        }
        return this.toDomain(prismaComment);
    }
    async update(id: string, changes: UpdateCommentDto): Promise<Comment> {
        logger.debug(
            { commentId: id, changes, action: "update comment" },
            "[CommentRepository] Updating comment"
        );
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
        logger.debug(
            { commentId: id, action: "delete comment" },
            "[CommentRepository] Deleting comment"
        );
        await this.checkExistence(id);
        await this.prisma.comments.delete({ where: { id } });
    }

    // Public view
    async findByPostId(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<CommentView>> {
        logger.debug(
            { postId, pagination, sort, action: "list comments by post" },
            "[CommentRepository] Finding comments for post"
        );
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
            const commentView = await this.toView(prismaComment);
            items.push(commentView);
        }
        return { items, total, page, limit };
    }

    async countByPostId(postId: string): Promise<number> {
        logger.debug(
            { postId, action: "count comments by post" },
            "[CommentRepository] Counting comments for post"
        );
        const count = await this.prisma.comments.count({ where: { post_id: postId } });
        return count;
    }

    async checkExistence(id: string): Promise<void> {
        logger.debug(
            { commentId: id, action: "check comment existence" },
            "[CommentRepository] Checking comment existence"
        );
        const comment = await this.prisma.comments.findUnique({ where: { id } });

        if (!comment) {
            logger.warn(
                { commentId: id, action: "check comment existence" },
                "[CommentRepository] Comment not found"
            );
            throw new CommentNotFoundError(id);
        }
    }

    private async insert(comment: CreateCommentDto): Promise<string> {
        logger.trace(
            { postId: comment.postId, authorId: comment.authorId, action: "insert comment" },
            "[CommentRepository] Inserting new comment"
        );
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
        logger.trace(
            { commentId: prismaComment.id, action: "map to domain" },
            "[CommentRepository] Mapping Prisma → Domain Comment"
        );
        const comment = new Comment({
            id: prismaComment.id,
            postId: prismaComment.post_id,
            authorId: prismaComment.author_id,
            content: prismaComment.content,
            createdAt: prismaComment.created_at,
        });
        return comment;
    }

    private async toView(comment: PrismaComment): Promise<CommentView> {
        logger.trace(
            { commentId: comment.id, action: "map to view" },
            "[CommentRepository] Mapping to CommentView"
        );
        const author = await this.userRepository.fetchPublicProfile(comment.author_id);
        return {
            id: comment.id,
            author: author,
            content: comment.content,
            createdAt: comment.created_at,
        };
    }
}
