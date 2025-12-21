import apiClient from "@/lib/api-client";

export interface OverviewStats {
    users: {
        dailyLogins: number[]; // Number of users logged in per day of the month
        totalUsers: number; // Total registered users
        activeUsers: number; // Users active this month
        newUsers: number; // Users registered this month
    };
    events: {
        dailyCreated: number[]; // Number of events created per day of the month
        totalEvents: number; // Total events
        activeEvents: number; // Currently active events
        completedEvents: number; // Completed events
        canceledEvents: number; // Canceled events
    };
    registrations: {
        topEventsByRegistration: { name: string; count: number }[]; // Top events by registrations
        dailyRegistrations: number[]; // Number of registrations per day
        totalRegistrations: number;
    };
}

export const overviewStatsService = {
    async getVolunteerStats() {
        const { data } = await apiClient.get<OverviewStats>("/stats");
        return data;
    },
};
