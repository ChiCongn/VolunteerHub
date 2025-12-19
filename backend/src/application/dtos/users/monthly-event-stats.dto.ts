export interface MonthlyEventStatsDto {
    year: number;
    monthlyCounts: {
        month: number; // 1 - 12
        joinedEvents: number;
    }[];
}
