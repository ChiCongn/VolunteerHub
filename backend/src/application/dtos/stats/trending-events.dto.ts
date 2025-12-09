export interface TrendingEventDto {
    eventId: string;
    name: string;
    rank: number;               // 1, 2, 3,...
    currentParticipants: number;
    increaseParticipants: number;
    growthRate: number;         // %
    period: {
        from: string;
        to: string;
    };
}
