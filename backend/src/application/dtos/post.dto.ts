import { PublicUserProfile } from "./user.dto";

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
    id: string;
    author: PublicUserProfile;
    content: string;
    imageUrl: string;
    createddAt: Date;
}