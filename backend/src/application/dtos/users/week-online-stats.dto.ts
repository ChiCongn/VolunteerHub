export interface WeeklyOnlineStatsDto {
    currentWeek: {
        weekStart: string; // YYYY-MM-DD (Monday)
        dailyHours: number[]; // length = 7 (Mon → Sun)
        totalHours: number;
    };
    previousWeek: {
        weekStart: string;
        dailyHours: number[];
        totalHours: number;
    };
    comparePercent: number; // +20.5 / -10.2
}

export interface UserDailyActivityRow {
    activityDate: Date;
    onlineSeconds: number;
}
