import type { EventCategory, EventStatus } from "./enum";

export interface Event {
    id: string;
    ownerId: string;

    name: string;
    location: string;
    startTime: Date;
    endTime: Date | null;
    description: string;
    imageUrl: string;
    categories: EventCategory[];
    status: EventStatus;

    capacity: number;
    registerCount: number;
    updatedAt: Date;
}