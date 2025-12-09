import { DomainError } from "./domain.error";

export class CommentNotFoundError extends DomainError {
    constructor(commentId: string) {
        super("COMMENT_NOT_FOUND", `Comment with ID ${commentId} does not exist`, [commentId]);
    }
}

export class NotCommentAuthorError extends DomainError {
    constructor(commentId: string, userId: string) {
        super("NOT_COMMENT_AUTHOR", `User ${userId} is not the author of comment ${commentId}`, [
            userId,
            commentId,
        ]);
    }
}

export class InvalidCommentContentError extends DomainError {
    constructor(reason: string) {
        super("INVALID_COMMENT_CONTENT", `Comment is invalid: ${reason}`, [reason]);
    }
}

export class CommentOnUnapprovedEventError extends DomainError {
    constructor(eventId: string) {
        super(
            "COMMENT_ON_UNAPPROVED_EVENT",
            `Cannot comment on post in unapproved event ${eventId}`,
            [eventId]
        );
    }
}
