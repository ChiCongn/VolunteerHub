import { DomainError } from "./domain.error";

export class PostNotFoundError extends DomainError {
    constructor(postId: string) {
        super("POST_NOT_FOUND", `Post ${postId} not found`, [postId]);
    }
}

export class NotPostAuthorError extends DomainError {
    constructor(postId: string, userId: string) {
        super("NOT_POST_AUTHOR", `User ${userId} is not author of post ${postId}`, [
            userId,
            postId,
        ]);
    }
}

export class PostInUnapprovedEventError extends DomainError {
    constructor(eventId: string) {
        super("POST_IN_UNAPPROVED_EVENT", `Cannot post in unapproved event ${eventId}`, [eventId]);
    }
}

export class ReactionAlreadyExistsError extends DomainError {
    constructor(postId: string, userId: string) {
        super("REACTION_EXISTS", `User ${userId} already reacted to post ${postId}`, [
            userId,
            postId,
        ]);
    }
}
