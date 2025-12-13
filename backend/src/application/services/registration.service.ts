import { AlreadyRegisteredError, RegistrationNotFoundError } from "../../domain/errors/registration.error";
import { IRegistrationRepository } from "../../domain/repositories/registration.irepository";
import { RegistrationRepository } from "../../infrastructure/repositories/registration.repository";
import logger from "../../logger";

export class RegistrationService {
    constructor(private readonly repo: IRegistrationRepository) {}

    async register(userId: string, eventId: string) {
        logger.debug(
            { userId, eventId, action: "register" },
            "[RegistrationService] Registering user to an event"
        );

        const exists = await this.repo.checkExistsByUserAndEvent(userId, eventId);
        if (exists) {
            logger.warn(
                { userId, eventId, action: "register" },
                "[RegistrationService] Registration already exists"
            );
            throw new AlreadyRegisteredError(eventId, userId);
        }

        //TODO: check event is aproved and registration is open
        return this.repo.register(userId, eventId);
    }

    async withdrawRegistration(registrationId: string) {
        logger.debug(
            { registrationId, action: "withdrawRegistration" },
            "[RegistrationService] Withdrawing registration"
        );

        const exists = await this.repo.exists(registrationId);
        if (!exists) {
            logger.warn(
                { registrationId, action: "withdrawRegistration" },
                "[RegistrationService] Registration does not exist"
            );
            throw new RegistrationNotFoundError(registrationId);
        }

        await this.repo.withdrawRegistration(registrationId);
    }
}
