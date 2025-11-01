import { EventStatus, EventCategory } from "./enums";

export interface CreateEventDto {
    name: string;
    location: string;
    startTime: Date;
    endTime?: Date | null;
    description: string;
    imageUrl: string;
    capacity: number;
    categories?: EventCategory[];
    ownerId: string;
}

export interface UpdateEventDto {
    name?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date | null;
    description?: string;
    imageUrl?: string;
    categories?: EventCategory[];
    capacity?: number;
}

export interface EventFilterDto {
    status?: EventStatus;
    location?: string;
    name?: string;
    categories?: EventCategory[];
    dateRange?: [Date, Date];
    ownerId?: string;
}
