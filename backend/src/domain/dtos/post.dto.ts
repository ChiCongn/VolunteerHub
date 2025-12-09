import { UserRole, UserStatus } from "../entities/enums";

export interface CreatePostProps {
    id: string,
    eventId: string,
    authorId: string,
    content: string,
    imageUrl: string,
    createdAt: Date,
}

export interface UpdatePostProps {
    content: string,
    imageUrl: string,
}
