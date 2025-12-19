import { ListResult } from "../../application/dtos/list-result.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { Registration, RegistrationFilterDto } from "../../application/dtos/registration.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";

export interface IRegistrationRepository {
    register(userId: string, eventId: string): Promise<string>;
    withdrawRegistration(registrationId: string): Promise<void>;
    listRegistration(
        filters: RegistrationFilterDto,
        pagination: Pagination,
        sortOption: SortOption
    ): Promise<ListResult<Registration>>;
    checkExistsByUserAndEvent(userId: string, eventId: string): Promise<boolean>;
    exists(registrationId: string): Promise<boolean>;
}
