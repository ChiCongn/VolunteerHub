export interface CreateCommentDto {
    postId: string;
    authorId: string;
    content: string;
}

export interface UpdateCommentDto {
    content: string;
}
