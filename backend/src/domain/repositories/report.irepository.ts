import { ListResult } from "../../application/dtos/list-result.dto";
import { Pagination } from "../../application/dtos/pagination.dto";
import { CreateReportDto, UpdateReportDto, ReportFilterDto } from "../../application/dtos/report.dto";
import { SortOption } from "../../application/dtos/sort-option.dto";
import { ReportStatus } from "../entities/enums";


export interface IReportRepository {
    create(dto: CreateReportDto): Promise<Report>;
    findById(id: string): Promise<Report | null>;

    listReports(
        filter?: ReportFilterDto,
        pagination?: Pagination,
        sort?: SortOption
    ): Promise<ListResult<Report>>;

    update(id: string, dto: UpdateReportDto): Promise<Report>;
    delete(id: string): Promise<void>;

    findByReporterId(userId: string): Promise<Report[]>;
    findByTargetId(targetId: string): Promise<Report[]>;
    countByStatus(status: ReportStatus): Promise<number>;
}