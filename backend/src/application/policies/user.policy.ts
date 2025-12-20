import { UserRole } from "../../domain/entities/enums";
import { AuthContext, requireRole } from "./helpers";

/**
 * UserPolicy contains authorization logic for user-related actions.
 *
 * ⚠ Note:
 * - All functions throw ForbiddenError if the user is not authorized.
 * - User must already be active; active status is checked in the global `authorize` middleware before calling any policy.
 */
export const UserPolicy = {
    /**
     * List all users with filters
     * Only RootAdmin & Admin
     */
    list: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },

    /**
     * Get the logged-in user's own profile
     * Allowed for any authenticated user (Self)
     */
    getCurrentUserProfile: async (authUser: AuthContext) => {
        // Naturally allowed if authenticated
        return;
    },

    /**
     * Update own profile / soft delete account
     * Allowed for any authenticated user (Self)
     */
    updateProfile: async (authUser: AuthContext) => {
        // Authenticate middleware already ensures user is 'me'
        return;
    },

    /**
     * Soft delete own account
     */
    softDelete: async (authUser: AuthContext) => {
        return;
    },

    /**
     * Tracking and Heartbeat (Login streak, Online time)
     * Allowed for any authenticated user (Self)
     */
    trackActivity: async (authUser: AuthContext) => {
        return;
    },

    /**
     * Personal Statistics Dashboards
     * (Streak, Weekly Online, Monthly Events)
     */
    viewPersonalStats: async (authUser: AuthContext) => {
        // Accessing personal stats is allowed for the owner
        return;
    },

    /**
     * Search users by username
     * Typically allowed for all authenticated users to find friends/managers
     */
    searchByUsername: async (authUser: AuthContext) => {
        return;
    },

    /**
     * Fetch public profile of another user
     * Allowed for all authenticated users
     */
    fetchPublicProfile: async (authUser: AuthContext) => {
        return;
    },

    /**
     * Lock or unlock a user account
     * Strict: Only RootAdmin & Admin
     */
    setUserLock: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },
};
