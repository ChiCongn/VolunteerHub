import apiClient from "@/lib/api-client";

export const managerStatsService = {
    /**
     * Get counts of events grouped by status (Manager view)
     */
    async getStatusOverview() {
        const { data } = await apiClient.get<ManagerEventStatusOverview[]>(
            `/stats/managers/status-overview`
        );
        return data;
    },

    /**
     * Get number of completed events per month for a specific year
     */
    async getMonthlyCompleted(year?: number) {
        const { data } = await apiClient.get<ManagerMonthlyCompletedStats[]>(
            `/stats/managers/monthly-completed`,
            { params: { year } }
        );
        return data;
    },

    /**
     * Get top 5 events with the most participants
     */
    async getTopParticipants(limit?: number) {
        const { data } = await apiClient.get<ManagerTopParticipantsEvent[]>(
            `/stats/managers/top-participants`,
            { params: { limit } }
        );
        return data;
    },
};

// Status overview of events managed by a manager
export interface ManagerEventStatusOverview {
    status: string;
    count: number;
}

// Monthly completed events stats for a manager
export interface ManagerMonthlyCompletedStats {
    month: string; // "January", "February", ...
    count: number;
}

// Top events by participants for a manager
export interface ManagerTopParticipantsEvent {
    id: string;
    name: string;
    register_count: number;
    capacity: number;
}