import { CreatePostProps, UpdatePostProps } from "../dtos/post.dto";

// backend/src/domain/entities/Post.ts
export class Post {
    public readonly id: string;
    public readonly eventId: string;
    public readonly authorId: string;
    private _content: string;
    private _imageUrl: string;
    private _updatedAt: Date;

    constructor(post: CreatePostProps) {
        this.id = post.id;
        this.eventId = post.eventId;
        this.authorId = post.authorId;
        this._content = post.content;
        this._imageUrl = post.imageUrl;
        this._updatedAt = post.updatedAt;
    }

    updatePost(updatePost: UpdatePostProps): void {
        if (updatePost.content) this._content = updatePost.content;
        if (updatePost.imageUrl) this._imageUrl = updatePost.imageUrl;
        this.touch();
    }

    get content(): string { return this._content; }
    get imageUrl(): string {return this._imageUrl; }
    get updatedAt(): Date { return this._updatedAt; }

    private touch(): void {
        this._updatedAt = new Date();
    }
}