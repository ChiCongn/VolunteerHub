import { DomainError } from "./domain.error";
import { EmojiType } from "../entities/enums";

export class ReactionNotFoundError extends DomainError {
    constructor(postId: string, userId: string) {
        super("REACTION_NOT_FOUND", `User ${userId} has no reaction on post ${postId}`, [
            userId,
            postId,
        ]);
    }
}

export class ReactionAlreadyExistsError extends DomainError {
    constructor(postId: string, userId: string, emoji: EmojiType) {
        super("REACTION_EXISTS", `User ${userId} already reacted with ${emoji} on post ${postId}`, [
            userId,
            postId,
            emoji,
        ]);
    }
}

export class InvalidReactionEmojiError extends DomainError {
    constructor(emoji: string) {
        super("INVALID_REACTION_EMOJI", `Provided emoji "${emoji}" is not supported`, [emoji]);
    }
}

export class ReactionOnUnapprovedEventError extends DomainError {
    constructor(eventId: string) {
        super(
            "REACTION_ON_UNAPPROVED_EVENT",
            `Cannot react on post in unapproved event ${eventId}`,
            [eventId]
        );
    }
}
