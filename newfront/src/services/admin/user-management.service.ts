import apiClient from "@/lib/api-client";
import type { UserRole } from "@/types/enum";
import type { ListResult, Pagination } from "@/types/paging";
import type { ListUserFilterDto, UserProfile } from "@/types/user.type";

export const userManagementService = {
    async listUser(filters: ListUserFilterDto, pagination: Pagination) {
        const { data } = await apiClient.get<ListResult<UserProfile>>(
            "/users",
            {
                params: {
                    ...filters,
                    page: pagination.page,
                    limit: pagination.limit,
                },
            }
        );
        return data;
    },

    async getVolunteerStats() {
        const { data } = await apiClient.get<VolunteerStats>(
            "/stats/volunteers"
        );
        return data;
    },

    async getEventManagerStats() {
        const { data } = await apiClient.get<EventManagerStats>(
            "/stats/managers"
        );
        return data;
    },

    async setUserLock(userId: string, locked: boolean) {
        await apiClient.patch(`/users/${userId}/lock`, { locked });
    },

    async updateUserRole(userId: string, role: UserRole) {
        await apiClient.patch(`/users/${userId}/role`, { role });
    },
};

export interface VolunteerStats {
    totalVolunteers: number;
    activeCount: number;
    inactiveCount: number;
    lockedCount: number;

    newVolunteers: {
        today: number;
        thisWeek: number;
    };
}

export interface EventManagerStats {
    totalEventManagers: number;
    activeCount: number;
    inactiveCount: number;
    lockedCount: number;
}
