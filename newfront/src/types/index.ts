import type { UserProfile } from "./user.type";

// Event Interface (Dựa trên CreateEventProps của bạn)
export interface Event {
    id: string; // hoặc _id
    name: string;
    location: string;
    startTime: string; // JSON trả về string
    description: string;
    imageUrl?: string;
    capacity: number;
    registerCount: number;
    ownerId: string; // Hoặc object User nếu populate
}

// Post Interface
export interface Post {
    _id: string;
    author: UserProfile; // Backend cần populate field này
    event: any;
    content: string;

    imageUrl?: string;

    createdAt: string;
    //likes: string[];
    likeCount?: number;
    commentCount?: number;
}
