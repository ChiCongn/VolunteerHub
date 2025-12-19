import { LoginStreakDto } from "./login-streak.dto";
import { MonthlyEventStatsDto } from "./monthly-event-stats.dto";
import { WeeklyOnlineStatsDto } from "./week-online-stats.dto";
import { WeeklyEventParticipationDto } from "./weekly-event-participant.dto";


export interface UserDashboardStatsDto {
    online: WeeklyOnlineStatsDto;
    weeklyEvents: WeeklyEventParticipationDto;
    streak: LoginStreakDto;
    monthlyEvents: MonthlyEventStatsDto;
}
