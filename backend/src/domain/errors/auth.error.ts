import { DomainError } from "./domain.error";

export class InvalidCredentialsError extends DomainError {
    constructor() {
        super("INVALID_CREDENTIALS", "Email or password is incorrect");
    }
}

export class AccountLockedError extends DomainError {
    constructor() {
        super("ACCOUNT_LOCKED", "Account is locked. Contact support.");
    }
}

export class AccountPendingError extends DomainError {
    constructor() {
        super("ACCOUNT_PENDING", "Account is pending approval");
    }
}

export class EmailAlreadyExistsError extends DomainError {
    constructor(email: string) {
        super("EMAIL_EXISTS", `Email ${email} is already registered`, [email]);
    }
}

export class WeakPasswordError extends DomainError {
    constructor() {
        super("WEAK_PASSWORD", "Password must be at least 8 characters");
    }
}

export class UnauthorizedError extends DomainError {
    constructor(action: string) {
        super("UNAUTHORIZED", `Authentication required to ${action}`);
    }
}
