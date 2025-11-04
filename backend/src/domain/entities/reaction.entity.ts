import { EmojiType } from "./enums";
import { CreateReactionProps, UpdateReactionProps } from "../dtos/reaction.dto";

export class Reaction {
    public readonly id: string;
    public readonly postId: string;
    public readonly authorId: string;

    public emoji: EmojiType;

    constructor(reaction: CreateReactionProps) {
        this.id = reaction.id;
        this.postId = reaction.postId;
        this.authorId = reaction.authorId;
        this.emoji = reaction.emoji;

    }

    updateComment(updateReaction: UpdateReactionProps) {
        this.emoji = updateReaction.emoji;
    }

}