import {
    AuthContext,
    requireRegistrationOwner,
    requireManagerByRegistration
} from "./helpers";

export const RegistrationPolicy = {
    /**
     * Withdraw a registration
     * STRICTLY: Only the user who registered (the owner)
     */
    withdraw: async (authUser: AuthContext, registrationId: string) => {
        // Admins can manage all registrations
        await requireRegistrationOwner(authUser.id, registrationId);
    },

    /**
     * Approve/Reject/Update Status of a registration
     * Allowed for: Event Owner or Assigned Managers
     */
    updateStatus: async (authUser: AuthContext, registrationId: string) => {
        // Helper checks if authUser.id is a manager/owner of the event linked to this registration
        await requireManagerByRegistration(authUser.id, registrationId);
    },
};