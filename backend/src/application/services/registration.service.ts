import { RegistrationStatus } from "../../domain/entities/enums";
import { EventCapacityExceededError, EventNotFoundError } from "../../domain/errors/event.error";
import {
    AlreadyRegisteredError,
    InvalidRegistrationStateError,
    RegistrationClosedError,
    RegistrationNotFoundError,
} from "../../domain/errors/registration.error";
import { IEventRepository } from "../../domain/repositories/event.irepository";
import { IRegistrationRepository } from "../../domain/repositories/registration.irepository";
import { eventRepo, registrationRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { Pagination } from "../dtos/pagination.dto";
import { RegistrationFilterDto } from "../dtos/registration.dto";
import { SortOption } from "../dtos/sort-option.dto";

export class RegistrationService {
    constructor(
        private readonly registrationRepo: IRegistrationRepository,
        private readonly eventRepo: IEventRepository
    ) {}

    async register(userId: string, eventId: string) {
        logger.debug(
            { userId, eventId, action: "register" },
            "[RegistrationService] Registering user to an event"
        );

        const exists = await this.registrationRepo.checkExistsByUserAndEvent(userId, eventId);
        if (exists) {
            logger.warn(
                { userId, eventId, action: "register" },
                "[RegistrationService] Registration already exists"
            );
            throw new AlreadyRegisteredError(eventId, userId);
        }

        const canRegister = await this.eventRepo.canRegisterForEvent(eventId);
        if (!canRegister) {
            throw new EventCapacityExceededError(eventId);
        }

        return this.registrationRepo.register(userId, eventId);
    }

    async withdrawRegistration(registrationId: string) {
        logger.debug(
            { registrationId, action: "withdrawRegistration" },
            "[RegistrationService] Withdrawing registration"
        );

        const registration = await this.registrationRepo.findById(registrationId);
        if (!registration) {
            logger.warn({ registrationId }, "[RegistrationService] Registration not found");
            throw new RegistrationNotFoundError(registrationId);
        }

        // 2. Check status
        if (registration.status === RegistrationStatus.Rejected) {
            throw new InvalidRegistrationStateError(registrationId, registration.status);
        }

        // 3. Check event time (no withdraw after start)
        const startTime = await this.eventRepo.getEventStartTime(registration.eventId);

        if (new Date() >= startTime) {
            throw new RegistrationClosedError(registration.eventId);
        }

        // 4. Withdraw (soft update)
        await this.registrationRepo.withdrawRegistration(registrationId);
    }

    async updateRegistrationStatus(registrationId: string, isApprove: boolean) {
        logger.debug(
            { registrationId, isApprove, action: "updateRegistrationStatus" },
            "[RegistrationService] Updating registration status"
        );

        const registration = await this.registrationRepo.findById(registrationId);
        if (!registration) {
            logger.warn({ registrationId }, "[RegistrationService] Registration not found");
            throw new RegistrationNotFoundError(registrationId);
        }

        if (registration.status !== RegistrationStatus.Pending) {
            logger.warn(
                { registrationId, currentStatus: registration.status },
                "[RegistrationService] Cannot update status of a non-pending registration"
            );
            throw new InvalidRegistrationStateError(registrationId, registration.status);
        }

        try {
            await this.registrationRepo.updateRegistrationStatus(registrationId, isApprove);

            logger.info(
                { registrationId, status: isApprove ? "approved" : "rejected" },
                "[RegistrationService] Registration status updated successfully"
            );
        } catch (err: any) {
            logger.error(
                { registrationId, error: err.message },
                "[RegistrationService] Failed to update registration status"
            );
            throw err;
        }
    }

    async listRegistration(
        filters: RegistrationFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ) {
        const sortableFields = new Set(["r.created_at", "r.updated_at", "u.username"]);

        const sortField = sort && sortableFields.has(sort.field) ? sort.field : "r.updated_at";
        const sortOrder = sort?.order?.toLowerCase() === "asc" ? "asc" : "desc";
        const normalizedSort: SortOption = {
            field: sortField,
            order: sortOrder,
        };

        const page = Math.max(1, Number(pagination?.page) || 1);
        const limit = Math.max(1, Number(pagination?.limit) || 10);
        const normalizedPagination: Pagination = { page, limit };

        return this.registrationRepo.listRegistration(
            filters,
            normalizedPagination,
            normalizedSort
        );
    }

    async findOwnerId(registrationId: string): Promise<string | null> {
        const registration = await this.registrationRepo.findById(registrationId);
        if (!registration) {
            throw new RegistrationNotFoundError(registrationId);
        }
        return registration.userId;
    }

    async findAuthorizedManagersByRegistration(registrationId: string): Promise<string[]> {
        return await this.registrationRepo.findAuthorizedManagerIds(registrationId);
    }
}

export const registrationService = new RegistrationService(registrationRepo, eventRepo);
