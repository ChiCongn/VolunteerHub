export interface CreateLogDto {
    action: string;
    userId?: string;
    details?: any;
    ip?: string;
}

export interface LogFilterDto {
    userId?: string;
    action?: string;
    ip?: string;
    startDate?: Date;
    endDate?: Date;
}