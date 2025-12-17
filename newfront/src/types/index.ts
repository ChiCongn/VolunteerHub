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
    event: any;
    _id: string;
    content: string;
    imageUrl?: string;
    author: UserProfile; // Backend cần populate field này
    createdAt: string;
    likes: string[];
    commentsCount?: number;
}
