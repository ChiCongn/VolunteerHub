import { UserRole, UserStatus } from "../../application/dtos/enums";

export interface CreatePostProps {
    id: string,
    eventId: string,
    authorId: string,
    content: string,
    imageUrl: string,
    updatedAt: Date,
}

export interface UpdatePostProps {
    content: string,
    imageUrl: string,
}
