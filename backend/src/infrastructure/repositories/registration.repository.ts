import { PrismaClient, registrations } from "../prisma/generated/client";
import logger from "../../logger";
import { IRegistrationRepository } from "../../domain/repositories/registration.irepository";
import { Pagination } from "../../application/dtos/pagination.dto";
import {
    Registration,
    RegistrationEntity,
    RegistrationFilterDto,
} from "../../application/dtos/registration.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { RegistrationStatus, UserRole } from "../../domain/entities/enums";
import { ListResult } from "../../application/dtos/list-result.dto";
import { RegistrationNotFoundError } from "../../domain/errors/registration.error";

export class RegistrationRepository implements IRegistrationRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findById(registrationId: string): Promise<RegistrationEntity> {
        logger.debug({ registrationId }, "[RegistrationRepository] Finding registration by ID");
        const row = await this.prisma.registrations.findUnique({
            where: { id: registrationId },
            select: {
                id: true,
                user_id: true,
                event_id: true,
                status: true,
                created_at: true,
            },
        });

        if (!row) {
            logger.warn({ registrationId }, "[RegistrationRepository] Registration not found");
            throw new RegistrationNotFoundError(registrationId);
        }

        return {
            id: row.id,
            userId: row.user_id,
            eventId: row.event_id,
            status: row.status,
            createdAt: row.created_at,
        };
    }

    async register(userId: string, eventId: string): Promise<string> {
        logger.debug(
            {
                userId: userId,
                eventId: eventId,
                action: "register event",
            },
            "[RegistrationRepository] Registering to enroll an event"
        );

        const registration = await this.prisma.registrations.create({
            data: {
                user_id: userId,
                event_id: eventId,
            },
            select: {
                id: true,
            },
        });

        return registration.id;
    }

    async withdrawRegistration(id: string): Promise<void> {
        logger.debug(
            {
                registrationId: id,
                action: "unregister",
            },
            "[RegistrationRepository] Registering to enroll an event"
        );
        await this.prisma.registrations.delete({ where: { id } });
    }

    async updateRegistrationStatus(id: string, isApprove: boolean): Promise<void> {
        const newStatus = isApprove ? "approved" : "rejected";

        logger.debug(
            {
                registrationId: id,
                status: newStatus,
                action: "updateRegistrationStatus",
            },
            `[RegistrationRepository] Transitioning registration to ${newStatus}`
        );

        try {
            await this.prisma.registrations.update({
                where: { id },
                data: { status: newStatus },
            });
        } catch (err: any) {
            logger.error(
                { registrationId: id, status: newStatus, error: err.message },
                "[RegistrationRepository] Failed to update registration status"
            );
            throw err;
        }
    }

    async listRegistration(
        filters: RegistrationFilterDto,
        pagination: Pagination,
        sortOption: SortOption
    ): Promise<ListResult<Registration>> {
        logger.info(
            { filters, pagination, sortOption },
            "[RegistrationRepository] Listing registration"
        );

        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        conditions.push(`r.event_id = $${idx}::uuid`);
        params.push(filters.eventId);
        idx++;

        if (filters.username) {
            conditions.push(`LOWER(u.username) LIKE LOWER($${idx})`);
            params.push(`%${filters.username}%`);
            idx++;
        }
        if (filters.status) {
            conditions.push(`r.status = $${idx++}::registration_status`);
            params.push(filters.status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        logger.debug(
            { whereClause, action: "listRegistration" },
            "[RegistrationRepository] Built WHERE clause"
        );
        const total = await this.count(filters);
        const offset = (pagination.page - 1) * pagination.limit;
        const orderBy = `${sortOption.field} ${sortOption.order}`;
        const rows = await this.prisma.$queryRawUnsafe<
            {
                reg_id: string;
                status: RegistrationStatus;
                created_at: Date;
                user_id: string;
                username: string;
                avatar_url: string | "";
                role: UserRole;
            }[]
        >(
            `
            SELECT
                r.id           AS reg_id,
                r.status       AS status,
                r.created_at   AS created_at,
                u.id           AS user_id,
                u.username     AS username,
                u.avatar_url   AS avatar_url,
                u.role         AS role
            FROM registrations r
            JOIN users u ON u.id = r.user_id
            ${whereClause}
            ORDER BY ${orderBy}
            OFFSET ${offset}
            LIMIT ${pagination.limit};`,
            ...params
        );

        const items: Registration[] = rows.map((row) => ({
            regId: row.reg_id,
            user: {
                id: row.user_id,
                username: row.username,
                avatarUrl: row.avatar_url,
                role: row.role,
            },
            status: row.status,
            createdAt: row.created_at,
        }));
        return { items, total, page: pagination.page, limit: pagination.limit };
    }

    async count(filters: RegistrationFilterDto): Promise<number> {
        logger.info({ filters }, "[RegistrationRepository] Count registration");

        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        conditions.push(`r.event_id = $${idx}::uuid`);
        params.push(filters.eventId);
        idx++;

        if (filters.username) {
            conditions.push(`LOWER(u.username) LIKE LOWER($${idx})`);
            params.push(`%${filters.username}%`);
            idx++;
        }
        if (filters.status) {
            conditions.push(`r.status = $${idx++}::registration_status`);
            params.push(filters.status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        logger.debug(
            { whereClause, action: "listRegistration" },
            "[RegistrationRepository] Built WHERE clause"
        );

        const [result] = await this.prisma.$queryRawUnsafe<{ total: bigint }[]>(
            `
            SELECT COUNT(*) AS total
            FROM registrations r
            JOIN users u ON u.id = r.user_id
            ${whereClause};
            `,
            ...params
        );
        return Number(result.total);
    }

    async checkExistsByUserAndEvent(userId: string, eventId: string): Promise<boolean> {
        logger.debug(
            {
                userId: userId,
                eventId: eventId,
                action: "checkExistsByUserAndEvent",
            },
            "[RegistrationRepository] Checking the user is already register this event"
        );

        const exists = await this.prisma.registrations.findUnique({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId,
                },
            },
            select: { id: true },
        });
        return !!exists;
    }

    async exists(id: string): Promise<boolean> {
        const exists = await this.prisma.registrations.findUnique({
            where: { id },
            select: { id: true },
        });
        return !!exists;
    }

    async findAuthorizedManagerIds(registrationId: string): Promise<string[]> {
        const data = await this.prisma.registrations.findUnique({
            where: { id: registrationId },
            select: {
                events: {
                    select: {
                        owner_id: true,
                        event_manager_ids: true,
                    },
                },
            },
        });

        // If no registration or event found, return empty array (policy will then throw Forbidden/NotFound)
        if (!data || !data.events) {
            return [];
        }

        // Combine owner_id and the array of manager_ids into a single flat array
        const { owner_id, event_manager_ids } = data.events;

        // Using Set ensures the ID is unique even if the owner is also listed as a manager
        return Array.from(new Set([owner_id, ...event_manager_ids]));
    }
}
