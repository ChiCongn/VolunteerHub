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
