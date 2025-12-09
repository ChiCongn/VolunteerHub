export interface CreateCommentProps {
    id: string,
    postId: string,
    authorId: string,
    content: string,
    createdAt: Date;
}

export interface UpdateCommentProps {
    content: string,
}