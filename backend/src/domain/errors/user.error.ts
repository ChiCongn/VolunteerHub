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
