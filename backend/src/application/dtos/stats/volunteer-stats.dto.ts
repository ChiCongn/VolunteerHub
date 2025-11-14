export interface VolunteerStatsDto {
    totalVolunteers: number;
    activeCount: number;
    inactiveCount: number;
    lockedCount: number;

    newVolunteers: {
        today: number;
        thisWeek: number;
    };
}
