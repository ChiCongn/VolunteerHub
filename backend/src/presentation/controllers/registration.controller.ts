import { Request, RequestHandler, Response } from "express";
import {
    registrationService,
    RegistrationService,
} from "../../application/services/registration.service";
import logger from "../../logger";
import {
    RegistrationFilter,
    RegistrationFilterSchema,
} from "../validators/registration/filter-registration.schema";
import { InvalidRegistrationStateError, RegistrationClosedError, RegistrationNotFoundError } from "../../domain/errors/registration.error";
import { DomainError } from "../../domain/errors/domain.error";

export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}

    register = async (req: Request, res: Response) => {
        const userId = req.user.sub;
        const { eventId } = req.params;

        logger.info(
            { userId, eventId, action: "register" },
            "[RegistrationController] Registering user for event"
        );

        try {
            const result = await this.registrationService.register(userId, eventId);

            logger.info(
                { userId, eventId },
                "[RegistrationController] User registered successfully"
            );

            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { err, userId, eventId },
                "[RegistrationController] Failed to register user for event"
            );

            return res.status(500).json({ message: "Internal server error" });
        }
    };

    withdraw = async (req: Request, res: Response) => {
        const { registrationId } = req.params;

        logger.info(
            { registrationId, action: "withdraw" },
            "[RegistrationController] Withdrawing registration"
        );

        try {
            const result = await this.registrationService.withdrawRegistration(registrationId);

            logger.info(
                { registrationId },
                "[RegistrationController] Registration withdrawn successfully"
            );

            return res.status(200).json(result);
        } catch (err) {
            if (err instanceof RegistrationNotFoundError) {
                return res.status(404).json({ message: err.message });
            }
            if (err instanceof RegistrationClosedError) {
                return res.status(400).json({ message: err.message });
            }
            if (err instanceof InvalidRegistrationStateError) {
                return res.status(400).json({ message: err.message });
            }
            if (err instanceof DomainError) {
                return res.status(400).json({ message: err.message });
            }
            logger.error(
                { err, registrationId },
                "[RegistrationController] Failed to withdraw registration"
            );

            return res.status(500).json({ message: "Internal server error" });
        }
    };

    updateRegistrationStatus = async (req: Request, res: Response) => {
        const { registrationId } = req.params;
        const { approved } = req.body; // Expecting a boolean: true or false

        logger.info(
            { registrationId, approved, action: "handleRegistrationRequest" },
            "[RegistrationController] Processing registration decision"
        );

        try {
            await this.registrationService.updateRegistrationStatus(registrationId, approved);

            return res.status(200).json({
                message: `Registration successfully ${approved ? "approved" : "rejected"}`,
            });
        } catch (err: any) {
            logger.error({ err: err.message }, "[RegistrationController] Decision failed");
            return res.status(400).json({ error: err.message });
        }
    };

    listRegistration: RequestHandler<any, any, any, any> = async (req, res) => {
        try {
            const { eventId } = req.params;

            // Use Zod to parse and transform the query
            const {
                username,
                status,
                page = 1,
                limit = 20,
                sortBy = "r.updated_at",
                order = "desc",
            } = RegistrationFilterSchema.query.parse(req.query);

            logger.info(
                { eventId, username, status, page, limit, sortBy, order },
                "[RegistrationController] Listing registrations"
            );

            const result = await this.registrationService.listRegistration(
                { eventId, username, status },
                { page, limit },
                { field: sortBy, order }
            );

            logger.info(
                { count: result.items.length, total: result.total },
                "[RegistrationController] Registrations fetched successfully"
            );

            return res.status(200).json(result);
        } catch (err: any) {
            logger.error(
                { err: err.message },
                "[RegistrationController] Failed to list registrations"
            );

            // If Zod parsing fails, it usually throws an error that should be caught by middleware,
            // but here we catch it just in case.
            return res.status(err.name === "ZodError" ? 400 : 500).json({
                message: err.message || "Internal server error",
            });
        }
    };


    getMyJoinedEvents = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const data = await this.registrationService.getMyEvents(userId);

            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };
}

export const registrationController = new RegistrationController(registrationService);
