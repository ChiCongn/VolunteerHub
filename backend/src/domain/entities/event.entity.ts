import { EventCategory, EventStatus } from "../../application/dtos/enums";
import { CreateEventProps, UpdateEventProps } from "../dtos/event.dtos";

export class Event {
    public readonly id: string;
    public readonly _ownerId: string;

    private _name: string;
    private _location: string;
    private _startTime: Date;
    private _endTime: Date | null;
    private _description: string;
    private _imageUrl: string;
    private _categories: EventCategory[];
    private _status: EventStatus;

    private _eventManagerIds: string[];
    private _participantIds: string[];
    private _registerUserIds: string[];

    private _capacity: number;
    private _registerCount: number;
    private _updatedAt: Date;

    // loading from database
    constructor(event: CreateEventProps) {
        this.id = event.id;
        this._name = event.name;
        this._location = event.location;
        this._startTime = event.startTime;
        this._endTime = event.endTime;
        this._description = event.description;
        this._imageUrl = event.imageUrl;
        this._categories = event.categories;
        this._capacity = event.capacity;
        this._status = event.status;

        this._ownerId = event.ownerId;
        this._eventManagerIds = event.eventManagerIds ?? [];
        this._participantIds = event.participantIds ?? [];
        this._registerUserIds = event.registerUserIds ?? [];
        this._registerCount = event.registerCount ?? 0;
        this._updatedAt = event.updatedAt ?? new Date();
    }

    updatedEvent(updatedEvent: UpdateEventProps) {
        this._name = updatedEvent.name;
        this._location = updatedEvent.location;
        this._startTime = updatedEvent.startTime;
        this._endTime = updatedEvent.endTime;
        this._description = updatedEvent.description;
        this._imageUrl = updatedEvent.imageUrl;
        this._categories = updatedEvent.categories;
        this._capacity = updatedEvent.capacity;
        this._eventManagerIds = updatedEvent.eventManagerIds;
    }

    setStatus(newStatus: EventStatus): void {
        if (this._status === newStatus) return;
        this._status = newStatus;
        this.touch();
    }

    /**
     * Register a volunteer
     * @returns true if registration successful, false if already registered
     */
    registerUser(userId: string): boolean {
        return true;
    }

    /** Withdraw a registration */
    withdrawUser(userId: string): void {
        
    }

    /** Add a manager (admin-only action, so only domain service should call this) */
    addManager(managerId: string): void {
        
    }

    /** Remove a manager */
    removeManager(managerId: string): void {
        
    }

    // approve an user
    approveVolunteer(volunteerId: string): void {
        
    }

    get name() { return this._name; }
    get location() { return this._location; }
    get startTime() { return this._startTime; }
    get endTime() { return this._endTime; }
    get description() { return this._description; }
    get imageUrl() { return this._imageUrl; }
    get categories() { return [...this._categories]; }
    get status() { return this._status; }

    get eventManagerIds() { return [...this._eventManagerIds]; }
    get participantIds() { return [...this._participantIds]; }
    get registerUserIds() { return [...this._registerUserIds]; }

    get capacity() { return this._capacity; }
    get registerCount() { return this._registerCount; }
    get updatedAt() { return this._updatedAt; }

    // example
    private validate(): void {
        
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}
