export interface CreateCommentProps {
    id: string,
    postId: string,
    authorId: string,
    content: string,
    updatedAt: Date;
}

export interface UpdateCommentProps {
    content: string,
}