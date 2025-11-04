import { EventStatus, EventCategory } from "../entities/enums";

export interface CreateEventProps {
    id: string;
    name: string;
    location: string;
    startTime: Date;
    endTime: Date | null;
    description: string;
    imageUrl: string;
    categories: EventCategory[];
    capacity: number;
    status: EventStatus;
    ownerId: string;
    eventManagerIds: string[];
    participantIds: string[];
    registerUserIds: string[];
    registerCount?: number;
    updatedAt?: Date;
}

export interface UpdateEventProps {
    name?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date | null;
    description?: string;
    imageUrl?: string;
    categories?: EventCategory[];
    capacity?: number;
    eventManagerIds?: string[];
}