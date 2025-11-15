import { PrismaClient, events as PrismaEvent } from "../prisma/generated/client";
import { IEventRepository } from "../../domain/repositories/event.irepository";
import {
    CreateEventDto,
    UpdateEventDto,
    EventFilterDto,
    PublicEventView,
} from "../../application/dtos/event.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { PublicUserProfile } from "../../application/dtos/user.dto";
import {
    EventNotFoundError,
    EventAlreadyApprovedError,
    EventCannotBeCancelledError,
    EventCapacityInvalidError,
    EventTimeInvalidError,
} from "../../domain/errors/event.error";
import { EventStatus, EventCategory } from "../../domain/entities/enums";
import { Event } from "../../domain/entities/event.entity";
import { UserRepository } from "./user.repository";
import logger from "../../logger";

export class EventRepository implements IEventRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly userRepo: UserRepository
    ) {}

    // Core CRUD
    async create(event: CreateEventDto): Promise<Event> {
        logger.debug(
            { ownerId: event.ownerId, name: event.name, action: "create event" },
            "[EventRepository] Creating event"
        );
        if (event.capacity <= 0) {
            logger.warn(
                { capacity: event.capacity, action: "create event" },
                "[EventRepository] Invalid capacity"
            );
            throw new EventCapacityInvalidError();
        }

        if (event.endTime && new Date(event.endTime) <= new Date(event.startTime)) {
            logger.warn(
                { startTime: event.startTime, endTime: event.endTime, action: "create event" },
                "[EventRepository] Invalid time range"
            );
            throw new EventTimeInvalidError();
        }

        const eventId = await this.insert(event);
        return this.findById(eventId);
    }

    async findById(id: string): Promise<Event> {
        logger.debug(
            { eventId: id, action: "find event by id" },
            "[EventRepository] Fetching event by id"
        );

        const eventPrisma = await this.prisma.events.findUnique({ where: { id } });
        if (!eventPrisma) {
            logger.warn(
                { eventId: id, action: "find event by id" },
                "[EventRepository] Event not found"
            );
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
        logger.debug(
            { eventId: id, changes, action: "update event" },
            "[EventRepository] Updating event"
        );
        await this.checkExistedAndApprovedEvent(id);

        if (changes.capacity !== undefined && changes.capacity <= 0) {
            logger.warn(
                { eventId: id, capacity: changes.capacity, action: "update event" },
                "[EventRepository] Rejected update: invalid capacity"
            );
            throw new EventCapacityInvalidError();
        }
        if (changes.endTime && changes.startTime && changes.endTime <= changes.startTime) {
            logger.warn(
                {
                    eventId: id,
                    startTime: changes.startTime,
                    endTime: changes.endTime,
                    action: "update event",
                },
                "[EventRepository] Rejected update: invalid time range"
            );
            throw new EventTimeInvalidError();
        }

        await this.prisma.events.update({ where: { id }, data: changes });
        return this.findById(id);
    }

    async softDelete(id: string) {
        logger.debug(
            { eventId: id, action: "soft delete event" },
            "[EventRepository] Soft deleting event"
        );
        await this.checkExistedAndApprovedEvent(id);

        await this.prisma.events.update({
            where: { id },
            data: { status: "cancelled" },
        });
    }

    // Public view
    async fetchPublicView(id: string): Promise<PublicEventView> {
        logger.debug(
            { eventId: id, action: "fetch public view" },
            "[EventRepository] Fetching public view for event"
        );
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
            // redundant check but typescipt requires it
            logger.warn(
                { eventId: id, action: "fetch public view" },
                "[EventRepository] Approved event not found"
            );
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
        logger.debug(
            { filters, pagination, sort, action: "search events" },
            "[EventRepository] Searching events"
        );
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

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        logger.debug(
            { whereClause, action: "search events" },
            "[EventRepository] Built WHERE clause"
        );
        // Order clause
        const sortableFields = new Set([
            "name",
            "location",
            "status",
            "categories",
            "start_time",
            "end_time",
            "capacity",
            "register_count",
        ]);
        let orderBy: string;

        if (sort && sortableFields.has(sort.field)) {
            const order = sort.order?.toLowerCase() === "asc" ? "ASC" : "DESC";
            orderBy = `${sort.field} ${order}`;
        } else {
            orderBy = "start_time DESC";
        }
        console.log(orderBy);

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

        // Total count
        const total = await this.count(filters);

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<
            {
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
            }[]
        >(
            `
            SELECT id, name, location, start_time, end_time, description, image_url, owner_id, categories, register_count, capacity 
            FROM events
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};`,
            ...params
        );

        //Map to DTO
        const items: PublicEventView[] = itemsRaw.map((e) => ({
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

        logger.debug(
            { count: items.length, total, page, limit, action: "search events" },
            "[EventRepository] Search returned results"
        );
        return { items, total, page, limit };
    }

    // Event manager
    async approveEvent(id: string) {
        logger.debug({ eventId: id, action: "approve event" }, "[EventRepository] Approving event");
        const event = await this.prisma.events.findUnique({ where: { id } });
        if (!event) {
            logger.warn(
                { eventId: id, action: "approve event" },
                "[EventRepository] Event not found"
            );
            throw new EventNotFoundError(id);
        }

        if (event.status === EventStatus.Approved) {
            logger.warn(
                { eventId: id, action: "approve event" },
                "[EventRepository] Event already approved"
            );
            throw new EventAlreadyApprovedError(id);
        }

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Approved },
        });
    }

    async rejectEvent(id: string, reason: string) {
        logger.debug(
            { eventId: id, reason, action: "reject event" },
            "[EventRepository] Rejecting event"
        );
        const event = await this.prisma.events.findUnique({ where: { id } });
        if (!event) {
            logger.warn(
                { eventId: id, action: "reject event" },
                "[EventRepository] Event not found"
            );
            throw new EventNotFoundError(id);
        }

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Rejected },
        });
    }

    async completeEvent(id: string) {
        logger.debug(
            { eventId: id, action: "complete event" },
            "[EventRepository] Marking event as completed"
        );
        await this.checkExistedAndApprovedEvent(id);

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Completed },
        });
    }

    async cancelEvent(id: string) {
        logger.info({ eventId: id, action: "cancel event" }, "[EventRepository] Cancelling event");
        const event = await this.prisma.events.findUnique({ where: { id } });

        if (!event) {
            logger.warn(
                { eventId: id, action: "cancel event" },
                "[EventRepository] Event not found"
            );
            throw new EventNotFoundError(id);
        }

        if (event.status === EventStatus.Pending || event.status === EventStatus.Rejected) {
            logger.warn(
                { eventId: id, status: event.status, action: "cancel event" },
                "[EventRepository] Event not found or invalid status"
            );
            throw new EventCannotBeCancelledError(id, event.status);
        }

        if (event.status === EventStatus.Cancelled || event.status === EventStatus.Completed) {
            logger.warn(
                { eventId: id, status: event.status, action: "cancel event" },
                "[EventRepository] Event cannot be cancelled"
            );
            throw new EventCannotBeCancelledError(id, event.status);
        }

        await this.prisma.events.update({
            where: { id },
            data: { status: EventStatus.Cancelled },
        });
    }

    // Participant handling
    async getParticipantsByEventId(eventId: string): Promise<PublicUserProfile[]> {
        logger.debug(
            { eventId, action: "get participants" },
            "[EventRepository] Fetching participants for event"
        );
        await this.checkExistedAndApprovedEvent(eventId);
        const approvedUserIds = await this.getApprovedVolunteerIds(eventId);
        if (approvedUserIds.length === 0) {
            logger.debug(
                { eventId, count: 0, action: "get participants" },
                "[EventRepository] No participants"
            );
            return [];
        }

        const profiles = await Promise.all(
            approvedUserIds.map((userId) => this.userRepo.fetchPublicProfile(userId))
        );

        return profiles;
    }

    async getRegisteredUsersByEventId(eventId: string): Promise<PublicUserProfile[]> {
        logger.debug(
            { eventId, action: "get registered users" },
            "[EventRepository] Fetching registered users for event"
        );
        await this.checkExistedAndApprovedEvent(eventId);
        const registeredUserIds = await this.getRegisteredVolunteerIds(eventId);
        if (registeredUserIds.length === 0) {
            logger.debug(
                { eventId, count: 0, action: "get registered users" },
                "[EventRepository] No registered users"
            );
            return [];
        }

        const profiles = await Promise.all(
            registeredUserIds.map((userId) => this.userRepo.fetchPublicProfile(userId))
        );

        return profiles;
    }

    async getEventManagersByEventId(eventId: string): Promise<PublicUserProfile[]> {
        logger.debug(
            { eventId, action: "get managers" },
            "[EventRepository] Fetching managers for event"
        );
        const event = await this.prisma.events.findUnique({ where: { id: eventId } });
        if (
            !event ||
            event.status === EventStatus.Pending ||
            event.status === EventStatus.Rejected
        ) {
            logger.warn(
                { eventId, status: event?.status, action: "get managers" },
                "[EventRepository] Event not found or invalid status"
            );
            throw new EventNotFoundError(eventId);
        }

        const managerIds = event.event_manager_ids;
        if (managerIds.length === 0) {
            logger.debug(
                { eventId, count: 0, action: "get managers" },
                "[EventRepository] No managers"
            );
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
        sort?: SortOption
    ): Promise<ListResult<PublicEventView>> {
        logger.debug(
            { filters, pagination, sort, action: "list events admin" },
            "[EventRepository] Listing events for admin"
        );
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

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        logger.debug(
            { whereClause, action: "list events admin" },
            "[EventRepository] Built WHERE clause"
        ); // Order clause
        const orderBy = sort ? `${sort.field} ${sort.order.toUpperCase()}` : "start_time DESC";

        // Pagination
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 10;
        const offset = (page - 1) * limit;

        // Total count
        const total = await this.count(filters);

        // Fetch items
        const itemsRaw: any[] = await this.prisma.$queryRawUnsafe<
            {
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
            }[]
        >(
            `
            SELECT id, name, location, start_time, end_time, description, image_url, owner_id, categories, register_count, capacity
            FROM events
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${limit};`,
            ...params
        );

        //Map to DTO
        const items: PublicEventView[] = itemsRaw.map((e) => ({
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

        logger.debug(
            { count: items.length, total, page, limit, action: "list events admin" },
            "[EventRepository] List returned results"
        );
        return { items, total, page, limit };
    }

    async findByOwnerId(ownerId: string): Promise<PublicEventView[]> {
        logger.debug(
            { ownerId, action: "find by owner" },
            "[EventRepository] Fetching events by ownerId"
        );
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
        logger.debug({ filters, action: "count events" }, "[EventRepository] Counting events");
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

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const [result] = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
            `
            SELECT COUNT(*) FROM events
            ${whereClause};`,
            ...params
        );
        const total = Number(result.count);
        return total;
    }

    private async getRegisteredVolunteerIds(eventId: string): Promise<string[]> {
        logger.trace(
            { eventId, action: "get registered ids" },
            "[EventRepository] Fetching registered volunteer IDs"
        );
        const registers = await this.prisma.registrations.findMany({
            where: { event_id: eventId },
            select: { user_id: true },
        });

        const ids = registers.map((r: { user_id: string }) => r.user_id);
        return ids;
    }

    private async getApprovedVolunteerIds(eventId: string): Promise<string[]> {
        logger.trace(
            { eventId, action: "get approved ids" },
            "[EventRepository] Fetching approved volunteer IDs"
        );
        const approves = await this.prisma.registrations.findMany({
            where: { event_id: eventId, status: "approved" },
            select: { user_id: true },
        });

        const ids = approves.map((a: { user_id: string }) => a.user_id);
        return ids;
    }

    private async getPostIds(eventId: string): Promise<string[]> {
        logger.trace({ eventId, action: "get post ids" }, "[EventRepository] Fetching post IDs");
        const posts = await this.prisma.posts.findMany({
            where: {
                event_id: eventId,
                deleted_at: null,
            },
            select: { id: true },
        });

        const ids = posts.map((p: { id: string }) => p.id);
        return ids;
    }

    private async insert(event: CreateEventDto): Promise<string> {
        logger.trace(
            { name: event.name, ownerId: event.ownerId, action: "insert event" },
            "[EventRepository] Inserting new event"
        );
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

    async checkExistedAndApprovedEvent(id: string) {
        logger.debug(
            { eventId: id, action: "check event approved" },
            "[EventRepository] Checking event existence and approval"
        );

        const existing = await this.prisma.events.findUnique({ where: { id } });
        if (
            !existing ||
            existing.status === EventStatus.Rejected ||
            existing.status === EventStatus.Pending
        ) {
            logger.warn(
                { eventId: id, status: existing?.status, action: "check event approved" },
                "[EventRepository] Event not found or not approved"
            );
            throw new EventNotFoundError(id);
        }
    }

    private toDomain(
        prismaEvent: PrismaEvent & {
            participantIds: string[];
            registerUserIds: string[];
            postIds: string[];
        }
    ): Event {
        logger.trace(
            { eventId: prismaEvent.id, action: "map to domain" },
            "[EventRepository] Mapping Prisma event to domain"
        );
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
