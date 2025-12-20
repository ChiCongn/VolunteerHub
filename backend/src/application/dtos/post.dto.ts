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
    createdAt: Date;
    event: {
        id: string;
        name: string;
    };
    reactionCount: number;
    commentCount: number;
}

export interface PostAuthInfoDto {
    authorId: string;
    eventOwnerId: string;
    eventManagerIds: string[];
}
