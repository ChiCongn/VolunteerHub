import { EmojiType } from "../../application/dtos/enums";

export interface CreateReactionProps {
    id: string,
    postId: string,
    authorId: string,
    emoji: EmojiType,
}

export interface UpdateReactionProps {
    emoji: EmojiType,
}