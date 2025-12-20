import { Request } from "express";
import { UserRole, UserStatus } from "../../domain/entities/enums";
import { userService } from "../services/user.service";
import { ForbiddenError } from "../../domain/errors/user.error";
import logger from "../../logger";
import { eventService } from "../services/event.service";
import { postService } from "../services/post.service";
import { commentService } from "../services/comment.service";
import { notificationService } from "../services/notification.service";
import { registrationService } from "../services/registration.service";

export interface AuthContext {
    id: string;
    role: UserRole;
    status: UserStatus;
}

export const ResourceType = {} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

// 1. Build Auth Context

// JWT contains only a snapshot,
// user status or role might have changed since token was issued.
// Reload from DB ensures real-time correctness for sensitive authorization checks
export const buildAuthContext = async (req: Request): Promise<AuthContext> => {
    const id = req.user.sub;
    logger.debug(
        {
            action: "buildAuthContext",
            method: req.method,
            url: req.originalUrl || req.url,
            userId: id,
        },
        `[Authorization] Building AuthContext for user ${id})`
    );
    return userService.getAuthContext(id);
};

// 2. Role & Status Checks
export const requireRole = (role: UserRole, permittedRoles: UserRole[]) => {
    logger.debug(
        { action: "requireRole", currentRole: role, permittedRoles },
        `[Authorization] Checking role ${role} against [${permittedRoles.join(", ")}]`
    );

    if (!permittedRoles.includes(role)) {
        logger.error(
            { attemptedRole: role, permittedRoles: permittedRoles, action: "requireRole" },
            "[Authorization] Role is not permitted"
        );
        throw new ForbiddenError();
    }
};

export const requireActiveStatus = (status: UserStatus) => {
    logger.debug(
        { action: "requireActiveStatus", userStatus: status },
        `[Authorization] Checking user status: ${status}`
    );

    if (status !== UserStatus.Active) {
        logger.error(
            { userStatus: status, action: "requireActiveStatus" },
            "[Authorization] User status is not allowed"
        );
        throw new ForbiddenError();
    }
};

// 3. Event Permissions
export const requireOwnerEvent = async (userId: string, eventId: string) => {
    logger.debug(
        { action: "requireOwnerEvent", userId, eventId },
        `[Authorization] Checking event ownership for user ${userId}`
    );

    const ownerId = await eventService.findOwnerId(eventId);
    if (userId !== ownerId) {
        logger.error(
            { userId, action: "requireOwnerEvent" },
            `[Authorization] User with ID: ${userId} is not owner of event ${eventId}`
        );
        throw new ForbiddenError();
    }
};

export const requireManagerEvent = async (userId: string, eventId: string) => {
    logger.debug(
        { action: "requireManagerEvent", userId, eventId },
        `[Authorization] Checking event manager rights for user ${userId}`
    );

    const managerIds = await eventService.findManagerIds(eventId);

    if (!managerIds.includes(userId)) {
        logger.error(
            { userId, action: "requireManagerEvent" },
            `[Authorization] User with ID: ${userId} is not a manager of event ${eventId}`
        );
        throw new ForbiddenError();
    }
};

// Checks if a user is allowed to view or interact with an event
// Used for read operations and as a foundation for post/comment access
export const canAccessEvent = (userId: string, eventId: string) => {};

// 4. Post Permissions
export const requireAuthorPost = async (userId: string, postId: string) => {
    logger.debug(
        { action: "requireAuthorPost", userId, postId },
        `[Authorization] Checking post authorship for user ${userId}`
    );

    const authorId = await postService.findAuthorId(postId);
    if (userId !== authorId) {
        logger.error(
            { userId, action: "requireAuthorPost" },
            `[Authorization] User with ID: ${userId} is not author of post ${postId}`
        );
        throw new ForbiddenError();
    }
};

// users can view a post only if they are enrolled in (or participants of) the event it belongs to
export const canAccessPost = async (userId: string, postId: string) => {
    logger.debug(
        { action: "canAccessPost", userId, postId },
        `[Authorization] Checking post access for user ${userId}`
    );
    const eventId = await postService.findEventIdByPostId(postId);

    return eventService.isParticipant(userId, eventId);
};

// 5. Comment Permissions
export const requireAuthorComment = async (userId: string, commentId: string) => {
    logger.debug(
        { action: "requireAuthorComment", userId, commentId },
        `[Authorization] Checking comment authorship for user ${userId}`
    );

    const authorId = await commentService.findAuthorId(commentId);

    if (userId !== authorId) {
        logger.error(
            { userId, action: "requireAuthorComment" },
            `[Authorization] User with ID: ${userId} is not author of comment ${commentId}`
        );
        throw new ForbiddenError();
    }
};

// users can view a comment only if they are enrolled in (or participants of) the event
// that has the post it belongs to
export const canAccessComment = async (userId: string, commentId: string) => {
    logger.debug(
        { action: "canAccessComment", userId, commentId },
        `[Authorization] Checking comment access for user ${userId}`
    );
    const postId = await commentService.findPostIdByCommentId(commentId);

    return canAccessPost(userId, postId);
};

// 6. Reaction Permissions
export const requireAuthorReaction = (userId: string, reactionId: string) => {
    logger.debug(
        { action: "requireAuthorReaction", userId, reactionId },
        `[Authorization] Checking reaction ownership for user ${userId}`
    );
};

// 7. Notification Permissions
export const requireOwnerNotification = async (userId: string, notificationId: string) => {
    logger.debug(
        { action: "requireOwnerNotification", userId, notiId: notificationId },
        `[Authorization] Checking notification ownership for user ${userId}`
    );

    const ownerId = await notificationService.findOwnerId(notificationId);

    if (userId !== ownerId) {
        logger.error(
            { action: "requireOwnerNotification", userId, notiId: notificationId, ownerId },
            `[Authorization] User ${userId} does not own notification ${notificationId}`
        );
        throw new ForbiddenError();
    }
};

// 8. Registration Permissions
export const requireRegistrationOwner = async (userId: string, registrationId: string) => {
    logger.debug(
        { action: "requireRegistrationOwner", userId, registrationId },
        `[Authorization] Checking registration ownership for user ${userId}`
    );

    // Assuming your registrationService has a method to find the owner of a registration
    const ownerId = await registrationService.findOwnerId(registrationId);

    if (userId !== ownerId) {
        logger.error(
            { userId, action: "requireRegistrationOwner" },
            `[Authorization] User with ID: ${userId} is not owner of registration ${registrationId}`
        );
        throw new ForbiddenError();
    }
};

/**
 * Check if user is a manager or owner of the event associated with a registration
 */
export const requireManagerByRegistration = async (userId: string, registrationId: string) => {
    logger.debug(
        { action: "requireManagerByRegistration", userId, registrationId },
        `[Authorization] Checking manager rights for registration ${registrationId}`
    );

    // Fetch the manager/owner IDs associated with the event of this registration
    const authorizedIds =
        await registrationService.findAuthorizedManagersByRegistration(registrationId);

    if (!authorizedIds.includes(userId)) {
        logger.error(
            { userId, action: "requireManagerByRegistration" },
            `[Authorization] User ${userId} is not authorized to manage registration ${registrationId}`
        );
        throw new ForbiddenError();
    }
};
