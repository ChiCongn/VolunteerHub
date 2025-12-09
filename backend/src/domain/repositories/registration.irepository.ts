import { Pagination } from "../../application/dtos/pagination.dto";
import { RegistrationFilterDto } from "../../application/dtos/registration.dto";
import { Registration } from "../../application/dtos/registration/registration.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";

export interface IRegistrationRepository {
    register(userId: string, eventId: string): Promise<string>;
    withdrawRegistration(registrationId: string): Promise<void>;
    listRegistration(
        filters: RegistrationFilterDto,
        pagination: Pagination,
        sortOption: SortOption
    ): Promise<Registration[]>;
    exists(registrationId: string): Promise<boolean>;
}
