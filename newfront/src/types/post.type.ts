import type { PublicUserProfile } from "./user.type";

export interface Post {
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

export interface Reaction {
  postId: string;
  authorId: string;
  emoji: string;
  user?: {
    username: string;
    avatar_url: string;
  };
}