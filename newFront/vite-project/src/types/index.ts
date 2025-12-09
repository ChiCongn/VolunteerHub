// src/types/index.ts

// User Interface
export interface User {
    _id: string; // hoặc id tùy DB
    username: string;
    avatarUrl?: string;
    displayName?: string;
}

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
    content: string;
    imageUrl?: string;
    author: User; // Backend cần populate field này
    createdAt: string;
    likes: string[];
    commentsCount?: number;
}
