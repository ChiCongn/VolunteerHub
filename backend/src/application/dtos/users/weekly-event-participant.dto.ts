export interface WeeklyEventParticipationDto {
    weekStart: string;
    joinedEvents: number;
    target: number; // = 10
    progressPercent: number; // joined / target * 100
}

export interface WeeklyEventCountRow {
    weekStart: Date;
    count: number;
}
