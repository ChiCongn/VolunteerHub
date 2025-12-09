import { CreateNotificationProps } from "../dtos/notification.dto";

export class Notification {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _message: string;
    private readonly _type: string;
    private readonly _redirectUrl: string;
    private readonly _createdAt: Date;

    private _read: boolean;
    
    constructor(notification: CreateNotificationProps) {
        this._id = notification.id;
        this._userId = notification.userId;
        this._type = notification.type;
        this._message = notification.message;
        this._redirectUrl = notification.redirectUrl;
        this._read = notification.read;
        this._createdAt = notification.createdAt;
    }

    markAsRead() {
        this._read = true;
    }

    get id(): string { return this._id; }
    get type(): string { return this._type; }
    get message(): string { return this._message; }
    get read(): boolean { return this._read; }
    get createdAt(): Date { return this._createdAt; }
}