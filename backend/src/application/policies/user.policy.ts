import { UserRole, UserStatus } from "../../domain/entities/enums";
import { ForbiddenError } from "../../domain/errors/user.error";
import { AuthContext, requireActiveStatus, requireRole } from "./helpers";

/**
 * UserPolicy contains authorization logic for user-related actions.
 *
 * ⚠ Note:
 * - All functions throw ForbiddenError if the user is not authorized.
 * - User must already be active; active status is checked in the global `authorize` middleware before calling any policy.
 */
export const UserPolicy = {
    /**
     * Only admins (RootAdmin/Admin) can list or filter users.
     */
    list: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },

    /**
     * No policy required; JWT ensures this is the authenticated user.
     * Endpoint operates on the user's own profile.
     */
    getCurrentUserProfile: async () => {},

    /**
     * No policy required; JWT ensures this is the authenticated user.
     * Endpoint updates the user's own profile.
     */
    updateProfile: async () => {},

    /**
     * No policy required; JWT ensures this is the authenticated user.
     * Endpoint soft-deletes the user's own account.
     */
    softDelete: async (authUser: AuthContext, targetUserId: string) => {},

    /**
     * Any active user can search for other users by username.
     */
    searchByUsername: async (authUser: AuthContext) => {},

    /**
     * Anyone can fetch a user's public profile.
     */
    fetchPublicProfile: async (authUser: AuthContext) => {},

    /**
     * Only admins (RootAdmin/Admin) can lock or unlock user accounts.
     */
    setUserLock: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },
};
