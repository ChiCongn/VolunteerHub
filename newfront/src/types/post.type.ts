import type { UserRole } from "./enum";
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
}
export interface PublicUserProfile {
    id: string;
    username: string;
    avatarUrl: string;
    role: UserRole;
}