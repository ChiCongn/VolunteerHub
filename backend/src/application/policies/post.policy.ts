import { UserRole } from "../../domain/entities/enums";
import {
    AuthContext,
    requireActiveStatus,
    requireAuthorPost,
    requireManagerEvent,
    requireOwnerEvent,
    requirePartcipantEvent,
    requirePostEditPermission,
    requireRole,
} from "./helpers";

export const PostPolicy = {
    /**
     * Create a post
     * If posting to an event: Must be Manager/Owner of that event.
     * If general post: Authenticated.
     */
    participant: async (authUser: AuthContext, eventId: string) => {
        await requirePartcipantEvent(authUser.id, eventId);
    },

    /**
     * Update, Delete, or Restore a post
     * STRICTLY: Only the author (owner) of the post
     */
    editor: async (authUser: AuthContext, postId: string) => {
        // Event manager of the event contains this post
        // can moderate/delete any post
        await requirePostEditPermission(authUser.id, postId);
    },

    /**
     * View/Interact
     * Public or Authenticated
     */
    interact: async (_authUser: AuthContext) => {
        return;
    },
};
