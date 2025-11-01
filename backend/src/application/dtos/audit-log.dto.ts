export interface CreateAuditLogDto {
    action: string;
    userId?: string;
    details?: any;
    ip?: string;
}