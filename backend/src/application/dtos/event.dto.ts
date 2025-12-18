import { EventStatus, EventCategory } from "../../domain/entities/enums";

export interface CreateEventDto {
    name: string;
    location: string;
    startTime: Date;
    endTime?: Date | null;
    description: string;
    imageUrl: string;
    capacity: number;
    categories: EventCategory[] | [];
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
    name?: string;
    location?: string;
    categories?: EventCategory[];
    dateRange?: [Date, Date];
    ownerId?: string;
}

export interface PublicEventView {
    id: string;
    name: string;
    location: string;
    startTime: Date;
    endTime: Date | null;
    status: EventStatus;
    description: string;
    imageUrl: string;
    ownerId: string;
    categories: EventCategory[];
    registerCount: number;
    capacity: number;
}