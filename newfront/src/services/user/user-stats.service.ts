import apiClient from "@/lib/api-client";

export const userStartsService = {
    async getStreak() {
        const { data } = await apiClient.get<LoginStreak>(
            `/users/me/stats/streak`
        );
        return data;
    },

    async getWeeklyOnline() {
        const { data } = await apiClient.get<WeeklyOnlineStats>(
            `/users/me/stats/weekly-online`
        );
        console.log("weekly online", data);
        return data;
    },

    async getWeeklyEventParticipation() {
        const { data } = await apiClient.get<WeeklyEventParticipation>(
            `/users/me/stats/weekly-events`
        );
        return data;
    },

    async getMonthlyParticipatedEvent(year: number) {
        const { data } = await apiClient.get<MonthlyEventStats>("/users/me/stats/monthly-events", {
            params: {
                year
            },
        });
        return data;
    },
};

export interface LoginStreak {
    month: string; // YYYY-MM
    activeDates: string[]; // ["2025-01-01", "2025-01-02", ...]
}

export interface WeeklyEventParticipation {
    weekStart: string;
    joinedEvents: number;
    target: number; // = 10
    progressPercent: number; // joined / target * 100
}

export interface WeeklyOnlineStats {
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

export interface WeeklyEventParticipation {
    weekStart: string;
    joinedEvents: number;
    target: number; // = 10
    progressPercent: number; // joined / target * 100
}

export interface MonthlyEventStats {
    year: number;
    monthlyCounts: {
        month: number; // 1 - 12
        joinedEvents: number;
    }[];
}