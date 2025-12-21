import { ReportType, ReportStatus } from '../../domain/entities/enums';

export interface CreateReportDto {
    postId: string;
    reporterId: string;
    type: ReportType;
    reason: string;
}

export interface UpdateReportDto {
    status?: ReportStatus;
    reason?: string;
}

export interface ReportFilterDto {
    type?: ReportType;
    status?: ReportStatus;
}