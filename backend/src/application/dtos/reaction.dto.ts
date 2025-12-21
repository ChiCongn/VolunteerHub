import { EmojiType } from "../../domain/entities/enums";

export interface AddReactionDto {
    userId: string;
    postId: string;
    emoji: EmojiType;
}

export interface UpdateReactionDto {
    emoji: EmojiType;
}

