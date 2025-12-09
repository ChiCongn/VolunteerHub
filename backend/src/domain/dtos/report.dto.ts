import { ReportType, ReportTarget, ReportStatus } from "../entities/enums";

export interface CreateReportProps {
    id: string;
    reporterId: string;
    targetId: string;
    targetType: ReportTarget;
    type: ReportType;
    reason: string;
    status: ReportStatus;
    updatedAt: Date;
}

export interface UpdateReportProps {
    reason: string;
}