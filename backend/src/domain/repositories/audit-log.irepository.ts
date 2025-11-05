import { CreateLogDto, LogFilterDto } from "../../application/dtos/audit-log.dto";
import { ListResult } from "../../application/dtos/list-result.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { Log } from "../entities/log.entity";

export interface IAuditLogRepository {
    log(dto: CreateLogDto): Promise<void>;

    find(filter?: LogFilterDto, pagination?: Pagination, sort?: SortOption): Promise<ListResult<Log>>;
}
