export interface CommentView {
  id: string;
  author: PublicUserProfile;
  content: string;
  createdAt: Date;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  role: UserRole;
}

export type UserRole =
  | "volunteer"
  | "event_manager"
  | "admin"
  | "root_admin";
