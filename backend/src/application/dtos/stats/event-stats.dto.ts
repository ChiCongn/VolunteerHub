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

export interface EventRegistrationStatusCountDto {
    participatedCount: number;
    pendingCount: number;
    rejectCount: number;
}

export interface DailyParticipantDto {
    date: string;
    participantCount: number;
}

export interface DailyPostDto {
    date: string;
    postCount: number;
}

export interface EventGoalComparisonDto {
    eventId: string;
    targetParticipants: number; // capacity
    actualParticipants: number; // registered count
    completionRate: number;
}

// Status overview of events managed by a manager
export interface ManagerEventStatusOverviewDto {
    status: string;
    count: number;
}

// Monthly completed events stats for a manager
export interface ManagerMonthlyCompletedStatsDto {
    month: string; // "January", "February", ...
    count: number;
}

// Top events by participants for a manager
export interface ManagerTopParticipantsEventDto {
    id: string;
    name: string;
    register_count: number;
    capacity: number;
}
