import { UserRole } from "../../domain/entities/enums";
import {
    AuthContext,
    requireActiveStatus,
    requireAuthorPost,
    requireManagerEvent,
    requireOwnerEvent,
    requireRole,
} from "./helpers";

export const PostPolicy = {
    /**
     * Create a post
     * If posting to an event: Must be Manager/Owner of that event.
     * If general post: Authenticated.
     */
    create: async (authUser: AuthContext, eventId: string) => {
        
    },

    /**
     * Update, Delete, or Restore a post
     * STRICTLY: Only the author (owner) of the post
     */
    owner: async (authUser: AuthContext, postId: string) => {
        // Admins can moderate/delete any post
        requireAuthorPost(authUser.id, postId);
    },

    /**
     * View/Interact
     * Public or Authenticated
     */
    interact: async (_authUser: AuthContext) => {
        return;
    },
};
