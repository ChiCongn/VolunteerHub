import { CreateReportProps, UpdateReportProps } from '../dtos/report.dto';
import { ReportType, ReportStatus, ReportTarget } from './enums';

export class Report {
    public readonly id: string;
    public targetId: string;
    public targetType: ReportTarget;
    public type: ReportType;

    private _reporterId: string;
    private _status: ReportStatus;
    private _reason: string;
    private _updatedAt: Date;

    constructor(report: CreateReportProps) {
        this.id = report.id;
        this._reporterId = report.reporterId;
        this.targetId = report.targetId;
        this.targetType = report.targetType;
        this.type = report.type;
        this._reason = report.reason;
        this._status = report.status;
        this._updatedAt = report.updatedAt;
    }

    updateReport(updatedReport: UpdateReportProps) {
        this._reason = updatedReport.reason;
    }

    get reporterId() { return this._reporterId; }
    get status() { return this._status; }
    get reason() { return this._reason; }

    markReviewed(): void {
        this._status = ReportStatus.Reviewed;
        this.touch();
    }

    markResolved(): void {
        this._status = ReportStatus.Resolved;
        this.touch();
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}
