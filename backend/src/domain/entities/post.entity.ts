import { CreatePostProps, UpdatePostProps } from "../dtos/post.dto";

export class Post {
    public readonly id: string;
    public readonly eventId: string;
    public readonly authorId: string;
    private _content: string;
    private _imageUrl: string;
    private _createdAt: Date;

    constructor(post: CreatePostProps) {
        this.id = post.id;
        this.eventId = post.eventId;
        this.authorId = post.authorId;
        this._content = post.content;
        this._imageUrl = post.imageUrl;
        this._createdAt = post.createdAt;
    }

    updatePost(updatePost: UpdatePostProps): void {
        if (updatePost.content) this._content = updatePost.content;
        if (updatePost.imageUrl) this._imageUrl = updatePost.imageUrl;
        this.touch();
    }

    get content(): string { return this._content; }
    get imageUrl(): string {return this._imageUrl; }
    get updatedAt(): Date { return this._createdAt; }

    private touch(): void {
        this._createdAt = new Date();
    }
}