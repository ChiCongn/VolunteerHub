export type UserRole = 'volunteer' | 'event_manager' | 'admin';
export type UserStatus = 'pending' | 'active' | 'locked' | 'deleted';
export type EventStatus = 'pending' | 'approved' | 'ongoing' | 'cancelled' | 'completed';
export type EmojiType = 'like' | 'dislike' | 'sad' | 'angry' | 'wow' | 'haha';
export type NotificationType = 'system' | 'event' | 'user';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type ReportType =
  | 'spam'
  | 'harassment'
  | 'illegal_content'
  | 'violence'
  | 'copyright_violation'
  | 'other';
export type EventCategory =
  | 'education'
  | 'social'
  | 'technology_stem'
  | 'health_wellness'
  | 'community_service'
  | 'other';