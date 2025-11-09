export interface CreatePostDto {
    authorId: string;
    eventId: string;
    content: string;
    imageUrl?: string;
}

export interface UpdatePostDto {
    content?: string;
    imageUrl?: string;
}

export interface PostView {
    content: string;
    imageUrl?: string;
}