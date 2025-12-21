import { Comment } from "../../domain/entities/comment.entity";
import { CreateCommentDto, UpdateCommentDto, CommentView } from "../dtos/comment.dto";
import { Pagination } from "../dtos/pagination.dto";
import { SortOption } from "../dtos/sort-option.dto";
import { ListResult } from "../dtos/list-result.dto";
import { ICommentRepository } from "../../domain/repositories/comment.irepository";
import { commentRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { notificationService } from "./notification.service";
import { postService } from "./post.service";
import { userService } from "./user.service";

export class CommentService {
    constructor(private readonly commentRepo: ICommentRepository) {}

    // ================= Core CRUD =================
    async createComment(data: CreateCommentDto): Promise<Comment> {
        const comment = await this.commentRepo.create(data);

        (async () => {
            try {
                const postAuthorId = await postService.findAuthorId(data.postId);
                const sender = await userService.fetchCurrentUser(data.authorId);

                if (postAuthorId && postAuthorId !== data.authorId && sender) {
                    await notificationService.notifyUserInteraction(
                        postAuthorId,
                        sender.username,
                        "đã bình luận về bài viết của bạn",
                        data.postId
                    );
                }
            } catch (err) {
                logger.error("[CommentService] Notification failed", err);
            }
        })();

        return comment;
    }

    async getCommentById(id: string): Promise<Comment | null> {
        const comment = await this.commentRepo.findById(id);
        if (!comment) {
            throw new Error(`Comment with id ${id} not found`);
        }
        return comment;
    }

    async updateComment(id: string, changes: UpdateCommentDto): Promise<Comment> {
        await this.getCommentById(id);
        return this.commentRepo.update(id, changes);
    }

    async deleteComment(id: string): Promise<void> {
        await this.getCommentById(id);
        return this.commentRepo.delete(id);
    }

    // ================= Public Views =================
    async getCommentsByPost(
        postId: string,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<CommentView>> {
        return this.commentRepo.findByPostId(postId, pagination, sort);
    }

    // ================= Stats (Optional) =================
    async countCommentsInPost(postId: string): Promise<number> {
        return this.commentRepo.countByPostId(postId);
    }

    // ================= Utils =================
    async findAuthorId(commentId: string) {
        logger.debug(
            { commentId, action: "findAuthorId" },
            "[CommentService] Fetching author id of this comment"
        );
        return this.commentRepo.findAuthorId(commentId);
    }

    async findPostIdByCommentId(commentId: string) {
        logger.debug(
            { commentId, action: "findPostIdByCommentId" },
            "[CommentService] Fetching post id that this comment belong to"
        );
        return this.commentRepo.findPostIdByCommentId(commentId);
    }
}

export const commentService = new CommentService(commentRepo);
