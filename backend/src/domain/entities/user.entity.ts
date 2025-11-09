import { UserRole, UserStatus } from "./enums";
import { CreateUserProps, UpdateUserProps } from "../dtos/user.dtos";

export class User {
    public readonly id: string;

    private _username: string;
    private _email: string;
    private _passwordHash: string;
    private _avatarUrl: string;

    private _role: UserRole;
    private _status: UserStatus;

    private _notifications: string[];
    private _postIds: string[];
    private _participatedEventIds: string[];
    private _registeredEventIds: string[];

    private _lastLogin: Date | null;
    private _updatedAt: Date;

    constructor(props: CreateUserProps) {
        this.id = props.id;
        this._username = props.username;
        this._email = props.email;
        this._passwordHash = props.passwordHash;
        this._avatarUrl = props.avatarUrl ?? '/images/default-avatar.png';

        this._role = props.role;
        this._status = props.status;

        this._notifications = props.notificationIds ?? [];
        this._participatedEventIds = props.participatedEventIds ?? [];
        this._registeredEventIds = props.registeredEventIds ?? [];
        this._postIds = props.postIds ?? [];

        this._lastLogin = props.lastLogin ?? null;
        this._updatedAt = props.updatedAt ?? new Date();
    }

    // --- Getters ---
    get username() { return this._username; }
    get email() { return this._email; }
    get passwordHash() { return this._passwordHash; }
    get avatarUrl() { return this._avatarUrl; }

    get role() { return this._role; }
    get status() { return this._status; }

    get notifications() { return [...this._notifications]; }
    get postIds() { return [...this._postIds]; }
    get participatedEventIds() { return [...this._participatedEventIds]; }
    get registeredEventIds() { return [...this._registeredEventIds]; }

    get lastLogin() { return this._lastLogin; }
    get updatedAt() { return this._updatedAt; }

    // --- Business Logic ---
    updateProfile(update: UpdateUserProps): void {
        if (update.name) this._username = update.name;
        if (update.passwordHash) this._passwordHash = update.passwordHash;
        if (update.avatarUrl) this._avatarUrl = update.avatarUrl;
        this.touch();
    }

    updateLoginTime(): void {
        this._lastLogin = new Date();
        this.touch();
    }

    lock(): void {
        if (this._status === UserStatus.Deleted) throw new Error('Cannot lock deleted user');
        this._status = UserStatus.Locked;
        this.touch();
    }

    unlock(): void {
        this._status = UserStatus.Active;
        this.touch();
    }

    activate(): void {
        this._status = UserStatus.Active;
        this.touch();
    }

    softDelete(): void {
        this._status = UserStatus.Deleted;
        this.touch();
    }

    // ----- Array manipulations -----
    addNotification(id: string) {
        this._notifications.push(id);
        this.touch();
    }

    addRegisteredEvent(eventId: string) {
        if (!this._registeredEventIds.includes(eventId)) {
            this._registeredEventIds.push(eventId);
            this.touch();
        }
    }

    addParticipatedEvent(eventId: string) {
        if (!this._participatedEventIds.includes(eventId)) {
            this._participatedEventIds.push(eventId);
            this.touch();
        }
    }

    addPost(postId: string) {
        this._postIds.push(postId);
        this.touch();
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}