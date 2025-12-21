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
import { EventStatus, EventCategory, RegistrationStatus } from "../../domain/entities/enums";
import { Event, IEvent } from "../../domain/entities/event.entity";
import { UserRepository } from "./user.repository";
import logger from "../../logger";
import { RegistrationNotFoundError } from "../../domain/errors/registration.error";
import {
    DailyParticipantDto,
    DailyPostDto,
    EventRegistrationStatusCountDto,
} from "../../application/dtos/stats";

export class EventRepository implements IEventRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly userRepo: UserRepository
    ) {}

    // Core CRUD
    async create(event: CreateEventDto): Promise<IEvent> {
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

    async findById(id: string): Promise<IEvent> {
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

        return {
            id: eventPrisma.id,
            ownerId: eventPrisma.owner_id,
            name: eventPrisma.name,
            location: eventPrisma.location,
            startTime: eventPrisma.start_time,
            endTime: eventPrisma.end_time,
            description: eventPrisma.description || "",
            imageUrl: eventPrisma.image_url || "",
            categories: eventPrisma.categories as EventCategory[],
            status: eventPrisma.status as EventStatus,
            capacity: eventPrisma.capacity,
            registerCount: registeredUserIds.length,
            updatedAt: eventPrisma.updated_at || new Date(),
            
            participantIds: approvedUserIds,
            registerUserIds: registeredUserIds,
            postIds: postIds,
            eventManagerIds: [],
        };
    }

    async update(id: string, changes: UpdateEventDto): Promise<IEvent> {
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

        await this.prisma.events.update({
            where: { id },
            data: {
                name: changes.name,
                location: changes.location,
                start_time: changes.startTime,
                end_time: changes.endTime ?? null,
                description: changes.description,
                image_url: changes.imageUrl,
                capacity: changes.capacity,
                categories: changes.categories,
            },
        });
        return this.findById(id);
    }

    async softDelete(id: string) {
        logger.debug(
            { eventId: id, action: "soft delete event" },
            "[EventRepository] Soft deleting event"
        );
        // Check event exists (allow any status: pending, approved, rejected, etc.)
        const existing = await this.prisma.events.findUnique({ where: { id } });
        if (!existing) {
            logger.warn(
                { eventId: id, action: "soft delete event" },
                "[EventRepository] Event not found"
            );
            throw new EventNotFoundError(id);
        }

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
                status: true,
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
            status: event.status,
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
                status: EventStatus;
                description: string;
                imageUrl: string;
                ownerId: string;
                categories: EventCategory[];
                registerCount: number;
                capacity: number;
            }[]
        >(
            `
            SELECT id, name, location, start_time, end_time, status, description, image_url, owner_id, categories, register_count, capacity 
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
            status: e.status,
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
                status: EventStatus;
                description: string;
                imageUrl: string;
                ownerId: string;
                categories: EventCategory[];
                registerCount: number;
                capacity: number;
            }[]
        >(
            `
            SELECT id, name, location, start_time, end_time, status, description, image_url, owner_id, categories, register_count, capacity
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
            status: e.status,
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
                status: true,
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
            status: e.status,
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

    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.events.count({
            where: { id },
            take: 1,
        });
        return count > 0;
    }

    async canRegisterForEvent(eventId: string): Promise<boolean> {
        const event = await this.prisma.events.findUnique({
            where: { id: eventId },
            select: {
                capacity: true,
                register_count: true,
            },
        });

        if (!event) {
            throw new EventNotFoundError(eventId);
        }

        return event.register_count < event.capacity;
    }

    async getEventStartTime(eventId: string): Promise<Date> {
        const event = await this.prisma.events.findUnique({
            where: { id: eventId },
            select: {
                start_time: true,
            },
        });

        if (!event) {
            throw new EventNotFoundError(eventId);
        }

        return event.start_time;
    }

    async findOwner(eventId: string): Promise<string> {
        logger.debug(
            { eventId, action: "findOwner" },
            "[EventRepository] Fetching owner id of this event"
        );
        const result = await this.prisma.events.findUnique({
            where: { id: eventId },
            select: { owner_id: true },
        });

        if (!result) {
            logger.warn({ eventId, action: "findOwner" }, "[EventRepository] Event not found");
            throw new EventNotFoundError(eventId);
        }

        return result.owner_id;
    }

    async findManagers(eventId: string): Promise<string[]> {
        logger.debug(
            { eventId, action: "findManagers" },
            "[EventRepository] Fetching manager ids of this event"
        );
        const event = await this.prisma.events.findUnique({
            where: { id: eventId },
            select: {
                owner_id: true,
                event_manager_ids: true,
            },
        });

        if (!event) {
            logger.warn({ eventId, action: "findManagers" }, "[EventRepository] Event not found");
            throw new EventNotFoundError(eventId);
        }

        const explicitManagers = event.event_manager_ids ?? [];

        if (event.owner_id && !explicitManagers.includes(event.owner_id)) {
            return [...explicitManagers, event.owner_id];
        }

        return event.event_manager_ids;
    }

    async getRegistrationStatus(userId: string, eventId: string): Promise<RegistrationStatus> {
        logger.debug(
            { eventId, action: "getRegistrationStatus" },
            "[EventRepository] Fetching registration status"
        );
        const register = await this.prisma.registrations.findFirst({
            where: { user_id: userId, event_id: eventId },
            select: { status: true },
        });

        if (!register) {
            logger.warn(
                { eventId, action: "getRegistrationStatus" },
                "[EventRepository] Registration not found"
            );
            throw new RegistrationNotFoundError("none");
        }

        return register.status;
    }

    // =================== stats =========================
    async getEventParticipationStats(eventId: string): Promise<EventRegistrationStatusCountDto> {
        logger.debug(
            { eventId, action: "getEventParticipationStats" },
            "[EventRepository] Fetching registration status counts via groupBy"
        );

        const stats = await this.prisma.registrations.groupBy({
            by: ["status"],
            where: { event_id: eventId },
            _count: {
                status: true,
            },
        });

        const result: EventRegistrationStatusCountDto = {
            participatedCount: 0,
            pendingCount: 0,
            rejectCount: 0,
        };

        for (const row of stats) {
            switch (row.status) {
                case "approved":
                    result.participatedCount = row._count.status;
                    break;
                case "pending":
                    result.pendingCount = row._count.status;
                    break;
                case "rejected":
                    result.rejectCount = row._count.status;
                    break;
            }
        }

        return result;
    }

    async getApprovedRegistrations(
        eventId: string,
        days: number = 14
    ): Promise<DailyParticipantDto[]> {
        logger.debug(
            { eventId, days, action: "getApprovedRegistrations" },
            "[EventRepository] Fetching daily approved registrations trend"
        );
        const fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        fromDate.setDate(fromDate.getDate() - (days - 1)); // include today

        const rows = await this.prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT
            DATE(updated_at) AS date,
            COUNT(*)::int AS count
        FROM registrations
        WHERE
            event_id = ${eventId}
            AND status = 'approved'
            AND updated_at >= ${fromDate}
        GROUP BY DATE(updated_at)
        ORDER BY date ASC;
    `;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r.count]));

        const result: DailyParticipantDto[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const key = d.toISOString().slice(0, 10);

            result.push({
                date: key,
                participantCount: map.get(key) ?? 0,
            });
        }

        return result;
    }

    async getPostsDays(eventId: string, days: number = 14): Promise<DailyPostDto[]> {
        logger.debug(
            { eventId, days, action: "getPostsDays" },
            "[EventRepository] Fetching daily posts count trend"
        );
        const fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        fromDate.setDate(fromDate.getDate() - (days - 1)); // include today

        const rows = await this.prisma.$queryRaw<{ date: Date; count: number }[]>`
            SELECT
                DATE(created_at) AS date,
                COUNT(*)::int AS count
            FROM posts
            WHERE
                event_id = ${eventId}
                AND created_at >= ${fromDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC;
        `;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r.count]));

        const result: DailyPostDto[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const key = d.toISOString().slice(0, 10);

            result.push({
                date: key,
                postCount: map.get(key) ?? 0,
            });
        }

        return result;
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
