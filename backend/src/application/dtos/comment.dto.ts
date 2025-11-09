import { PublicUserProfile } from "./user.dto";

export interface CreateCommentDto {
    postId: string;
    authorId: string;
    content: string;
}

export interface UpdateCommentDto {
    content: string;
}

export interface CommentView {
    id: string;
    author: PublicUserProfile;
    content: string;
    updatedAt: Date;
}