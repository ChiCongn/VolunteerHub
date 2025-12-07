import { DomainError } from "./domain.error";

export class UserNotFoundError extends DomainError {
    constructor(userId: string) {
        super("USER_NOT_FOUND", `User with ID ${userId} not found`, [userId]);
    }
}

export class CannotModifyRootAdminError extends DomainError {
    constructor() {
        super("CANNOT_MODIFY_ROOT", "Root admin account cannot be modified");
    }
}

export class CannotDeleteSelfError extends DomainError {
    constructor() {
        super("CANNOT_DELETE_SELF", "You cannot delete your own account");
    }
}

export class RolePromotionNotAllowedError extends DomainError {
    constructor(from: string, to: string) {
        super("ROLE_PROMOTION_INVALID", `Cannot promote from ${from} to ${to}`);
    }
}

export class CannotDeleteLockedUserError extends DomainError {
    constructor(userId: string) {
        super(
            "CANNOT_DELETE_LOCKED_USER",
            "Cannot delete a locked user account. Unlock it first.",
            [userId]
        );
    }
}

export class CannotDeleteAlreadyDeletedUserError extends DomainError {
    constructor(userId: string) {
        super("USER_ALREADY_DELETED", "This user account has already been deleted", [userId]);
    }
}

export class UserLockedError extends DomainError {
    constructor(userId: string) {
        super("USER_LOCKED", `User account "${userId}" is locked and cannot be accessed`, [userId]);
    }
}

export class UserDeletedError extends DomainError {
    constructor(userId: string) {
        super("USER_DELETED", `User account "${userId}" has been deleted`, [userId]);
    }
}

export class UserPendingApprovalError extends DomainError {
    constructor(userId: string) {
        super("USER_PENDING_APPROVAL", `User "${userId}" is pending admin approval`, [userId]);
    }
}

export class ForbiddenError extends DomainError {
    constructor(resource?: string) {
        super(
            "FORBIDDEN",
            resource
                ? `You are not allowed to access ${resource}`
                : "You are not allowed to perform this action",
            resource ? [resource] : []
        );
    }
}
