import { CreateCommentProps, UpdateCommentProps } from "../dtos/comment.dto";

export class Comment {
    public readonly id: string;
    public readonly postId: string;
    public readonly authorId: string;

    private _content: string;
    private _updatedAt: Date;

    constructor(comment: CreateCommentProps) {
        this.id = comment.id;
        this.postId = comment.postId;
        this.authorId = comment.authorId;
        this._content = comment.content;
        this._updatedAt = comment.updatedAt;

    }

    updateComment(updateComment: UpdateCommentProps) {
        this._content = updateComment.content;
        this.touch();
    }

    get content(): string { return this._content; }
    get createdAt(): Date { return this._updatedAt; }

    private touch(): void {
        this._updatedAt = new Date();
    }
}