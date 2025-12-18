// export interface OverviewStatsDto {
//     users: {
//         total: number;
//         active: number;
//         newToday: number;
//     };
//     events: {
//         total: number;
//         active: number;
//         ongoing: number;
//         upcoming: number;
//     };
//     registrations: {
//         total: number;
//         today: number;
//         thisWeek: number;
//     };
// }

export interface OverviewStatsDto {
    users: {
        dailyLogins: number[]; // Number of users logged in per day of the month
        totalUsers: number; // Total registered users
        activeUsers: number; // Users active this month
        newUsers: number; // Users registered this month
    };
    events: {
        dailyCreated: number[]; // Number of events created per day of the month
        totalEvents: number; // Total events
        activeEvents: number; // Currently active events
        completedEvents: number; // Completed events
        canceledEvents: number; // Canceled events
    };
    registrations: {
        topEventsByRegistration: { name: string; count: number }[]; // Top events by registrations
        dailyRegistrations: number[]; // Number of registrations per day
        totalRegistrations: number;
    };
}
