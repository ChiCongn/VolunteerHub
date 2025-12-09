export interface OverviewStatsDto {
    users: {
        total: number;
        active: number;
        newToday: number;
    };
    events: {
        total: number;
        active: number;
        upcoming: number;
    };
    registrations: {
        total: number;
        today: number;
        thisWeek: number;
    };
}
