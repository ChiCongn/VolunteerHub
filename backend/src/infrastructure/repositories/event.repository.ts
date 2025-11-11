import { PrismaClient, events as PrismaEvent } from '../prisma/generated/client';
import { IEventRepository } from '../../domain/repositories/event.irepository';
import {
    CreateEventDto,
    UpdateEventDto,
    EventFilterDto,
    PublicEventView,
} from '../../application/dtos/event.dto';
import { Pagination } from '../../application/dtos/pagination.dto';
import { SortOption } from '../../application/dtos/sort-option.dto';
import { ListResult } from '../../application/dtos/list-result.dto';
import { PublicUserProfile } from '../../application/dtos/user.dto';
import {
    EventNotFoundError,
    EventAlreadyApprovedError,
    EventCannotBeCancelledError,
    EventCapacityExceededError,
    EventCapacityInvalidError,
    EventTimeInvalidError,
} from '../../domain/errors/event.error';
import { EventStatus, EventCategory } from "../../domain/entities/enums";
import { Event } from '../../domain/entities/event.entity';
import { CreateEventProps } from '../../domain/dtos/event.dtos';
import { UserRepository } from './user.repository';

export class EventRepository implements IEventRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly userRepo: UserRepository
    ) { }

    // Core CRUD
    async create(event: CreateEventProps): Promise<Event> {
        if (event.capacity <= 0) {
            throw new EventCapacityInvalidError();
        }

        if (event.endTime && new Date(event.endTime) <= new Date(event.startTime)) {
            throw new EventTimeInvalidError();
        }

        const eventId = await this.insert(event);
        return this.findById(eventId);
    }

    async findById(id: string): Promise<Event> {
        const eventPrisma = await this.prisma.events.findUnique({ where: { id } });
        if (!eventPrisma) {
            throw new EventNotFoundError(id);
        }
        const [registeredUserIds, approvedUserIds, postIds] = await Promise.all([
            this.getRegisteredVolunteerIds(id),
            this.getApprovedVolunteerIds(id),
            this.getPostIds(id),
        ]);

        return this.toDomain({
            ...eventPrisma,
            participantIds: approvedUserIds,
            registerUserIds: registeredUserIds,
            postIds: postIds,
        });
    }

    private async getRegisteredVolunteerIds(eventId: string): Promise<string[]> {
        const registers = await this.prisma.registrations.findMany({
            where: { event_id: eventId },
            select: { user_id: true },
        });

        return registers.map((r: { user_id: string }) => r.user_id);
    }

    private async getApprovedVolunteerIds(eventId: string): Promise<string[]> {
        const approves = await this.prisma.registrations.findMany({
            where: { event_id: eventId, status: 'approved' },
            select: { user_id: true },
        });

        return approves.map((a: { user_id: string }) => a.user_id);
    }

    private async getPostIds(eventId: string): Promise<string[]> {
        const posts = await this.prisma.posts.findMany({
            where: { event_id: eventId },
            select: { id: true },
        });

        return posts.map((p: { id: string }) => p.id);
    }

    private async insert(event: CreateEventDto): Promise<string> {
        const createdEvent = await this.prisma.events.create({
            data: {
                name: event.name,
                location: event.location,
                start_time: event.startTime,
                end_time: event.endTime ?? null,
                description: event.description,
                image_url: event.imageUrl,
                capacity: event.capacity,
                categories: event.categories,
                owner_id: event.ownerId,
            },
            select: { id: true },
        });

        return createdEvent.id;
    }

    private async checkExistedAndApprovedEvent(id: string) {
        const existing = await this.prisma.events.findUnique({ where: { id } });
        if (!existing || existing.status === EventStatus.Rejected ||
            existing.status === EventStatus.Pending) {
            throw new EventNotFoundError(id);
        }
    }

    private toDomain(prismaEvent: PrismaEvent & {
        participantIds: string[];
        registerUserIds: string[];
        postIds: string[];
    }): Event {
        return new Event({
            id: prismaEvent.id,
            name: prismaEvent.name,
            location: prismaEvent.location,
            startTime: prismaEvent.start_time,
            endTime: prismaEvent.end_time,
            description: prismaEvent.description,
            imageUrl: prismaEvent.image_url,
            categories: prismaEvent.categories as EventCategory[],
            capacity: prismaEvent.capacity,
            status: prismaEvent.status as EventStatus,

            ownerId: prismaEvent.owner_id,
            eventManagerIds: prismaEvent.event_manager_ids,
            participantIds: prismaEvent.participantIds,
            registerUserIds: prismaEvent.registerUserIds,
            postIds: prismaEvent.postIds,
            registerCount: prismaEvent.register_count ?? 0,
            updatedAt: prismaEvent.updated_at ?? undefined,
        });
    }
}