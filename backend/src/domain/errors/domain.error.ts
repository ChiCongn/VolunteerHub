export abstract class DomainError extends Error {
    public readonly code: string;
    public readonly details?: string[];

    constructor(code: string, message: string, details?: string[]) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON(): { code: string; message: string; details?: string[] } {
        return {
            code: this.code,
            message: this.message,
            ...(this.details && { details: this.details }),
        };
    }

    toResponse(): { error: string; message: string; details?: string[] } {
        return {
            error: this.code,
            message: this.message,
            ...(this.details && { details: this.details }),
        };
    }
}
