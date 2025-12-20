import { UserRole } from "../../domain/entities/enums";
import {
    AuthContext,
    requireManagerEvent,
    requireOwnerEvent,
    requireRole,
} from "./helpers";

export const EventPolicy = {
    /**
     * Public viewing actions
     */
    viewPublic: async (_authUser: AuthContext) => {
        return; // Open to everyone
    },

    /**
     * Create a new event
     * Only Event Managers
     */
    create: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.EventManager];
        requireRole(authUser.role, permittedRoles);
    },

    /**
     * Manage a specific event (Update, Delete, Complete, View Participants)
     * Must be the Owner or an Assigned Manager
     */
    manageEvent: async (authUser: AuthContext, eventId: string) => {
        await requireManagerEvent(authUser.id, eventId);
    },

    /**
     * Delete or Permanently Modify an Event
     * Allowed ONLY if user is:
     * - The original creator (owner_id) of the event, OR
     * - A platform Admin/RootAdmin (via bypass in helper or logic)
     * * Assigned Managers are NOT permitted to perform this action.
     */
    ownerEvent: async (authUser: AuthContext, eventId: string) => {
        await requireOwnerEvent(authUser.id, eventId);
    },

    /**
     * Volunteer actions (Registering for an event)
     */
    register: async (authUser: AuthContext) => {
        // Admin can not register event
        const permittedRoles = [UserRole.Volunteer, UserRole.EventManager];
        requireRole(authUser.role, permittedRoles);
        return;
    },

    /**
     * Admin Review Actions (Approve, Reject, List Pending)
     * Strictly RootAdmin & Admin
     */
    review: async (authUser: AuthContext) => {
        const permittedRoles = [UserRole.RootAdmin, UserRole.Admin];
        requireRole(authUser.role, permittedRoles);
    },
};
