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
import { validate as isUuid } from 'uuid';

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

    async update(id: string, changes: UpdateEventDto): Promise<Event> {
        await this.checkExistedAndApprovedEvent(id);

        if (changes.capacity && changes.capacity <= 0) throw new EventCapacityInvalidError();
        if (changes.endTime && changes.startTime && changes.endTime <= changes.startTime) {
            throw new EventTimeInvalidError();
        }

        await this.prisma.events.update({ where: { id }, data: changes });

        return this.findById(id);
    }

    async softDelete(id: string) {
        await this.checkExistedAndApprovedEvent(id);

        await this.prisma.events.update({
            where: { id },
            data: { status: 'cancelled' },
        });
    }

    // Public view
    async fetchPublicView(id: string): Promise<PublicEventView> {
        await this.checkExistedAndApprovedEvent(id);

        const event = await this.prisma.events.findUnique({
            where: { id, status: EventStatus.Approved },
            select: {
                id: true,
                name: true,
                description: true,
                start_time: true,
                end_time: true,
                location: true,
                owner_id: true,
                image_url: true,
                categories: true,
                capacity: true,
                register_count: true,
            },
        });

        if (!event) {
            throw new EventNotFoundError(id);
        }

        return {
            id: event.id,
            name: event.name,
            description: event.description,
            startTime: event.start_time,
            endTime: event.end_time ?? null,
            location: event.location,
            imageUrl: event.image_url,
            ownerId: event.owner_id,
            categories: event.categories,
            capacity: event.capacity,
            registerCount: event.register_count,
        };
    }

    async searchEvent(
        filters?: EventFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<PublicEventView>> {
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filters?.status) {
            conditions.push(`status = $${idx++}::event_status`);
            params.push(filters.status);
        }
        if (filters?.name) {
            conditions.push(`LOWER(name) LIKE LOWER($${idx})`);
            params.push(`%${filters.name}%`);
            idx++;
        }
        if (filters?.location) {
            conditions.push(`LOWER(location) LIKE LOWER($${idx})`);
            params.push(`%${filters.location}%`);
            idx++;
        }
        if (filters?.categories && filters.categories.length > 0) {
            conditions.push(`categories && $${idx}::event_category[]`); // overlap or using @> for contain all
            params.push(filters.categories);
            idx++;
        }
        if (filters?.dateRange) {
            conditions.push(`start_time >= $${idx} AND end_time <= $${idx + 1}`);
            params.push(filters.dateRange[0], filters.dateRange[1]);
            idx += 2;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        console.log("where clause: " + whereClause);

        // Order clause
        const orderBy = sort ? `${sort.field} ${sort.order.toUpperCase()}` : 'start_time DESC';

        // Pagination
        const page = pagination?.page ?? 0;
        const limit = pagination?.limit ?? 10;

        // Total count
        const total = await this.count(filters);

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<{
            id: string;
            name: string;
            location: string;
            startTime: Date;
            endTime: Date | null;
            description: string;
            imageUrl: string;
            ownerId: string;
            categories: EventCategory[];
            registerCount: number;
            capacity: number;
        }[]>(`
            SELECT id, name, location, start_time, end_time, description, image_url, owner_id, categories, register_count, capacity            FROM users 
            FROM events
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${page}
            LIMIT ${limit};`,
            ...params
        );

        //Map to DTO
        const items: PublicEventView[] = itemsRaw.map(e => ({
            id: e.id,
            name: e.name,
            description: e.description,
            startTime: e.start_time,
            endTime: e.end_time ?? null,
            location: e.location,
            ownerId: e.owner_id,
            imageUrl: e.image_url,
            categories: e.categories,
            capacity: e.capacity,
            registerCount: e.register_count,
        }));

        return { items, total, page, limit };
    }

    // Event manager
    async approveEvent(id: string) {
        const event = await this.prisma.events.findUnique({ where: { id } });
        if (!event) {
            throw new EventNotFoundError(id);
        }

        if (event.status === EventStatus.Approved) {
            throw new EventAlreadyApprovedError(id);
        }

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Approved },
        });
    }

    async rejectEvent(id: string, reason: string) {
        const event = await this.prisma.events.findUnique({ where: { id } });
        if (!event) {
            throw new EventNotFoundError(id);
        }

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Rejected },
        });
    }

    async completeEvent(id: string) {
        await this.checkExistedAndApprovedEvent(id);

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Completed },
        });
    }

    async cancelEvent(id: string) {
        const event = await this.prisma.events.findUnique({ where: { id } });

        if (!event || event.status === EventStatus.Pending || event.status === EventStatus.Rejected) {
            throw new EventNotFoundError(id);
        }

        if (event.status === EventStatus.Cancelled || event.status === EventStatus.Completed) {
            throw new EventCannotBeCancelledError(id, event.status);
        }

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Cancelled },
        });
    }

    // Participant handling
    async getParticipantsByEventId(eventId: string): Promise<PublicUserProfile[]> {
        await this.checkExistedAndApprovedEvent(eventId);
        const approvedUserIds = await this.getApprovedVolunteerIds(eventId);
        if (approvedUserIds.length === 0) {
            return [];
        }

        const profiles = await Promise.all(
            approvedUserIds.map((userId) => this.userRepo.fetchPublicProfile(userId))
        );

        return profiles;
    }

    async getRegisteredUsersByEventId(eventId: string): Promise<PublicUserProfile[]> {
        await this.checkExistedAndApprovedEvent(eventId);
        const registeredUserIds = await this.getRegisteredVolunteerIds(eventId);
        if (registeredUserIds.length === 0) {
            return [];
        }

        const profiles = await Promise.all(
            registeredUserIds.map((userId) => this.userRepo.fetchPublicProfile(userId))
        );

        return profiles;
    }

    async getEventManagersByEventId(eventId: string): Promise<PublicUserProfile[]> {
        const event = await this.prisma.events.findUnique({ where: { id: eventId } });
        if (!event || event.status === EventStatus.Pending || event.status === EventStatus.Rejected) {
            throw new EventNotFoundError(eventId);
        }

        const managerIds = event.event_manager_ids;
        if (managerIds.length === 0) {
            return [];
        }

        const profiles = await Promise.all(
            managerIds.map((userId) => this.userRepo.fetchPublicProfile(userId))
        );

        return profiles;
    }

    // Admin view
    async listEvents(
        filters?: EventFilterDto,
        pagination?: Pagination,
        sort?: SortOption,
    ): Promise<ListResult<PublicEventView>> {
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filters?.status) {
            conditions.push(`status = $${idx++}::event_status`);
            params.push(filters.status);
        }
        if (filters?.name) {
            conditions.push(`LOWER(name) LIKE LOWER($${idx})`);
            params.push(`%${filters.name}%`);
            idx++;
        }
        if (filters?.location) {
            conditions.push(`LOWER(location) LIKE LOWER($${idx})`);
            params.push(`%${filters.location}%`);
            idx++;
        }
        if (filters?.categories && filters.categories.length > 0) {
            conditions.push(`categories && $${idx}::event_category[]`); // overlap or using @> for contain all
            params.push(filters.categories);
            idx++;
        }
        if (filters?.dateRange) {
            conditions.push(`start_time >= $${idx} AND end_time <= $${idx + 1}`);
            params.push(filters.dateRange[0], filters.dateRange[1]);
            idx += 2;
        }
        if (filters?.ownerId) {
            conditions.push(`owner_id = $${idx}::uuid`);
            params.push(filters.ownerId);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        console.log("where clause: " + whereClause);

        // Order clause
        const orderBy = sort ? `${sort.field} ${sort.order.toUpperCase()}` : 'start_time DESC';

        // Pagination
        const page = pagination?.page ?? 0;
        const limit = pagination?.limit ?? 10;

        // Total count
        const total = await this.count(filters);

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<{
            id: string;
            name: string;
            location: string;
            startTime: Date;
            endTime: Date | null;
            description: string;
            imageUrl: string;
            ownerId: string;
            categories: EventCategory[];
            registerCount: number;
            capacity: number;
        }[]>(`
            SELECT id, name, location, start_time, end_time, description, image_url, owner_id, categories, register_count, capacity            FROM users 
            FROM events
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${page}
            LIMIT ${limit};`,
            ...params
        );

        //Map to DTO
        const items: PublicEventView[] = itemsRaw.map(e => ({
            id: e.id,
            name: e.name,
            description: e.description,
            startTime: e.start_time,
            endTime: e.end_time ?? null,
            location: e.location,
            ownerId: e.owner_id,
            imageUrl: e.image_url,
            categories: e.categories,
            capacity: e.capacity,
            registerCount: e.register_count,
        }));

        return { items, total, page, limit };
    }

    async findByOwnerId(ownerId: string): Promise<PublicEventView[]> {
        const events = await this.prisma.events.findMany({
            where: { owner_id: ownerId },
            select: {
                id: true,
                name: true,
                description: true,
                start_time: true,
                end_time: true,
                location: true,
                owner_id: true,
                image_url: true,
                categories: true,
                capacity: true,
                register_count: true,
            },
        });

        return events.map((e) => ({
            id: e.id,
            name: e.name,
            description: e.description,
            startTime: e.start_time,
            endTime: e.end_time ? e.end_time : null,
            location: e.location,
            ownerId: e.owner_id,
            imageUrl: e.image_url,
            categories: e.categories,
            capacity: e.capacity,
            registerCount: e.register_count,
        }));
    }

    async count(filters?: EventFilterDto): Promise<number> {
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filters?.status) {
            conditions.push(`status = $${idx++}::event_status`);
            params.push(filters.status);
        }
        if (filters?.name) {
            conditions.push(`LOWER(name) LIKE LOWER($${idx})`);
            params.push(`%${filters.name}%`);
            idx++;
        }
        if (filters?.location) {
            conditions.push(`LOWER(location) LIKE LOWER($${idx})`);
            params.push(`%${filters.location}%`);
            idx++;
        }
        if (filters?.categories && filters.categories.length > 0) {
            conditions.push(`categories && $${idx}::event_category[]`); // overlap or using @> for contain all
            params.push(filters.categories);
            idx++;
        }
        if (filters?.dateRange) {
            conditions.push(`start_time >= $${idx} AND end_time <= $${idx + 1}`);
            params.push(filters.dateRange[0], filters.dateRange[1]);
            idx += 2;
        }
        if (filters?.ownerId) {
            conditions.push(`owner_id = $${idx}::uuid`);
            params.push(filters.ownerId);
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        return await this.prisma.$queryRawUnsafe<number>(`
            SELECT COUNT(*) FROM events
            ${whereClause};`,
            ...params
        ) as number;
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
        if (!isUuid(id)) {
            throw new EventNotFoundError(id);
        }

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