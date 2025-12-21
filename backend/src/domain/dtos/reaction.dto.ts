import { EmojiType } from "../entities/enums";

// export interface CreateReactionProps {
//     id: string;
//     postId: string;
//     authorId: string;
//     emoji: EmojiType;
// }

export interface UpdateReactionProps {
    emoji: EmojiType;
}

export interface CreateReactionProps {
    [x: string]: string;
    postId: string;
    authorId: string;
    emoji: EmojiType;
}
