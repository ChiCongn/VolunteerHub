import { ICommentRepository } from "../../domain/repositories/comment.irepository";
import { commentRepo } from "../../infrastructure/repositories";
import logger from "../../logger";

export class CommentService {
    constructor(private readonly commentRepo: ICommentRepository) {}

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
