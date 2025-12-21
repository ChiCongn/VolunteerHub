import { ReportType, ReportStatus, ReportTarget } from '../../domain/entities/enums';

export interface CreateReportDto {
    targetId: string;
    targetType: ReportTarget;
    reporterId: string;
    type: ReportType;
    reason: string;
}

export interface UpdateReportDto {
    reason?: string;
}

export interface ReportFilterDto {
    reporterId?: string;
    targetId?: string;
    targetType?: ReportTarget;
    type?: ReportType;
    status?: ReportStatus;
}