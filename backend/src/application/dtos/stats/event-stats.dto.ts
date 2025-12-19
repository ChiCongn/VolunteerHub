export interface EventStatsDto {
    eventId: string;
    name: string;

    participants: {
        count: number;
        previousCount: number;
        growthRate: number; // (count-previous)/previous
    };

    posts: {
        count: number;
        previousCount: number;
        growthRate: number;
    };

    period: {
        from: string; // ISO
        to: string; // ISO
    };

    comparisonPeriod: {
        from: string;
        to: string;
    };
}

export interface EventProgressDTO {
    eventId: string;
    eventName: string;
    participatedCount: number;
    pendingCount: number;
}

export interface DailyActivityDTO {
    date: string;
    participantCount: number;
    postCount: number;
}

export interface ActivityDashboardDTO {
    timeRange: string; // Last 14 Days
    data: DailyActivityDTO[];
}

export interface EventGoalComparisonDTO {
    eventId: string;
    targetParticipants: number; // capacity
    actualParticipants: number; // registered count
    completionRate: number;
}
