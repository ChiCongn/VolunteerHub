import { CreateCommentProps, UpdateCommentProps } from "../dtos/comment.dto";

export class Comment {
    public readonly id: string;
    public readonly postId: string;
    public readonly authorId: string;
    public readonly createdAt: Date;

    private _content: string;

    constructor(comment: CreateCommentProps) {
        this.id = comment.id;
        this.postId = comment.postId;
        this.authorId = comment.authorId;
        this._content = comment.content;
        this.createdAt = comment.createdAt;

    }

    updateComment(updateComment: UpdateCommentProps) {
        this._content = updateComment.content;
    }

    get content(): string { return this._content; }
}