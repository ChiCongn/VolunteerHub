export interface EventsStatsDto {
    totalEvents: number;

    totalParticipants: number;
    avgParticipantsPerEvent: number;

    totalPosts: number;
    avgPostsPerEvent: number;

    activeEvents: number;
    completedEvents: number;
}
