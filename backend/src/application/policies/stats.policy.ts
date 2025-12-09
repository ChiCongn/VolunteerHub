import { UserRole } from "../../domain/entities/enums";
import {
    AuthContext,
    requireActiveStatus,
    requireManagerEvent,
    requireOwnerEvent,
    requireRole,
} from "./helpers";

/**
 * Centralized authorization policies for Stats module
 * All functions throw if user is not authorized → use with permission middleware
 */
export const StatsPolicy = {
    /**
     * Platform-wide overview stats
     * Only RootAdmin & Admin
     */
    overview: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },

    /**
     * Aggregated stats for ALL events (with filters)
     * Only RootAdmin & Admin
     */
    allEventsStats: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },

    /**
     * Stats for a SINGLE event
     * Allowed if user is:
     *   - Event Manager AND manages this event, OR
     *   - Owner of this event
     *
     * Note: Both checks are independent → one passing is enough
     */
    eventStats: async (authUser: AuthContext, eventId: string) => {
        requireManagerEvent(authUser.id, eventId);
    },

    /**
     * Trending events leaderboard
     * Publicly visible (no auth needed) → empty policy
     */
    trendingEvents: async (_authUser: AuthContext) => {
        // Anyone can view trending events
        return;
    },

    /**
     * Volunteer statistics dashboard
     * Only RootAdmin & Admin
     */
    volunteerStats: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },

    /**
     * Event Manager statistics dashboard
     * Only RootAdmin & Admin
     */
    eventManagersStats: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },
};
