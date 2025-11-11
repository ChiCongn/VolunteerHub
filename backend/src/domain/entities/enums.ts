export const UserRole = {
    Volunteer: 'volunteer',
    EventManager: 'event_manager',
    Admin: 'admin',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const UserStatus = {
    Pending: 'pending',
    Active: 'active',
    Locked: 'locked',
    Deleted: 'deleted',
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export const EventStatus = {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
    Ongoing: 'ongoing',
    Cancelled: 'cancelled',
    Completed: 'completed',
} as const;
export type EventStatus = typeof EventStatus[keyof typeof EventStatus];

export const EmojiType = {
    Like: 'like',
    Dislike: 'dislike',
    Sad: 'sad',
    Angry: 'angry',
    Wow: 'wow',
    Haha: 'haha',
} as const;
export type EmojiType = typeof EmojiType[keyof typeof EmojiType];

export const NotificationType = {
    System: 'system',
    Event: 'event',
    User: 'user',
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const RegistrationStatus = {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
} as const;
export type RegistrationStatus = typeof RegistrationStatus[keyof typeof RegistrationStatus];

export const ReportTarget = {
    Post: 'post',
    Comment: 'comment',
} as const;
export type ReportTarget = typeof ReportTarget[keyof typeof ReportTarget];

export const ReportType = {
    Spam: 'spam',
    Harassment: 'harassment',
    IllegalContent: 'illegal_content',
    Violence: 'violence',
    CopyrightViolation: 'copyright_violation',
    Other: 'other',
} as const;
export type ReportType = typeof ReportType[keyof typeof ReportType];

export const ReportStatus = {
    Pending: 'pending',
    Reviewed: 'reviewed',
    Resolved: 'resolved',
} as const;
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export const EventCategory = {
    Education: 'education',
    Social: 'social',
    TechnologyStem: 'technology_stem',
    HealthWellness: 'health_wellness',
    CommunityService: 'community_service',
    Other: 'other',
} as const;
export type EventCategory = typeof EventCategory[keyof typeof EventCategory];