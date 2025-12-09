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

export class LoginFailedError extends DomainError {
    constructor() {
        super("LOGIN_FAILED", "Login failed due to invalid credentials or account issues");
    }
}

export class InvalidRefreshTokenError extends DomainError {
    constructor() {
        super("INVALID_REFRESH_TOKEN", "The provided refresh token is invalid or expired");
    }
}

export class RefreshTokenNotFoundError extends DomainError {
    constructor() {
        super("REFRESH_TOKEN_NOT_FOUND", "Refresh token is invalid or does not exist");
    }
}

export class RefreshTokenRevokedError extends DomainError {
    constructor() {
        super("REFRESH_TOKEN_REVOKED", "Refresh token has been revoked");
    }
}

export class RefreshTokenExpiredError extends DomainError {
    constructor() {
        super("REFRESH_TOKEN_EXPIRED", "Refresh token has expired");
    }
}
