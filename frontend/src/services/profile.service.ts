import { api } from "../lib/axios";
import type { User, UserProfile } from "../types/user";

export const profileService = {
    /**
     * Get the profile of the current user or a user by ID.
     */
    async getUserProfile(userId: string) {
        // use stored user
    },

    /**
     * Update the profile of a user by ID.
     */
    async updateUserProfile(
        data: Partial<UserProfile>
    ): Promise<User> {
        const response = await api.patch<User>("/users/me", data);
        return response.data;
    },

    /**
     * Update the profile of a user by ID.
     */
    async changePassword(password: string) {
        await api.patch<UserProfile>("/users/me", {
            password,
        });
    },

    /**
     * Get the profile of a user with admin privileges.
     * Typically contains more fields like email, status, etc.
     */
    async getAdminViewProfile(userId: string): Promise<UserProfile> {
        // fetch admin view of user
        const response = await api.get<UserProfile>(`/users/${userId}`);
        return response.data;
    },

    /**
     * Get public-facing profile of a user.
     * Only returns safe fields (like username, avatar, events attended, etc.)
     */
    async getPublicProfile(userId: string): Promise<Partial<UserProfile>> {
        const response = await api.get<Partial<UserProfile>>(`/users/${userId}`);
        return response.data;
    },
};
