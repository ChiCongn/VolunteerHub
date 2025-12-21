import { Calendar, Trophy, Clock } from "lucide-react";
import { ChartLineLinear } from "@/components/LineChart";
import {
  overviewStatsService,
  type OverviewStats,
} from "@/services/admin/overview.service";
import { useEffect, useState } from "react";

// export const sampleOverviewStats: OverviewStats = {
//   users: {
//     dailyLogins: [
//       12, 15, 10, 8, 20, 18, 25, 22, 19, 17, 23, 21, 14, 16, 20, 18, 22, 24, 26,
//       28, 30, 25, 27, 29, 31, 35, 32, 28, 30, 33, 36,
//     ], // 31 days sample
//     totalUsers: 420,
//     activeUsers: 350,
//     newUsers: 50,
//   },
//   events: {
//     dailyCreated: [
//       1, 0, 2, 1, 3, 1, 0, 2, 1, 0, 3, 2, 1, 0, 1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 0,
//       1, 2, 3, 2, 1, 0,
//     ],
//     totalEvents: 120,
//     activeEvents: 80,
//     completedEvents: 30,
//     canceledEvents: 10,
//   },
//   registrations: {
//     topEventsByRegistration: [
//       { name: "Health Awareness", count: 45 },
//       { name: "Beach Cleanup", count: 38 },
//       { name: "Blood Donation", count: 32 },
//       { name: "Tree Planting", count: 30 },
//       { name: "Food Drive", count: 25 },
//     ],
//     dailyRegistrations: [
//       5, 3, 4, 2, 6, 3, 5, 4, 2, 3, 6, 5, 4, 3, 2, 4, 5, 6, 3, 2, 4, 5, 3, 2, 4,
//       5, 6, 3, 4, 2, 5,
//     ],
//     totalRegistrations: 350,
//   },
// };

export default function OverviewPage() {
  // const { users, events, registrations } = sampleOverviewStats;
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await overviewStatsService.getVolunteerStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch overview stats", err);
        setError("Failed to fetch stats");
        //toast.error("Failed to fetch overview stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-card dark:bg-black">
      <div className="flex w-full justify-center">

        {/* Main content */}
        <div className="flex flex-1 justify-center min-w-0">
          <div className="space-y-6 w-full max-w-6xl p-6">
            <div>
              <h1 className="text-2xl font-semibold">Overview</h1>
              <p className="text-muted-foreground">App statistics</p>
            </div>

            {/* Top stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Users */}
              <div className="bg-white border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <Calendar className="w-5 h-5 text-[#43A047]" />
                </div>
                <p className="text-3xl font-semibold">
                  {stats?.users.totalUsers}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active this month: {stats?.users.activeUsers}
                </p>
                <p className="text-sm text-muted-foreground">
                  New this month: {stats?.users.newUsers}
                </p>
              </div>

              {/* Events */}
              <div className="bg-white border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {stats?.events.totalEvents}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active: {stats?.events.activeEvents}, Completed:{" "}
                  {stats?.events.completedEvents}, Canceled:{" "}
                  {stats?.events.canceledEvents}
                </p>
              </div>

              {/* Registrations */}
              <div className="bg-white border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Registrations</p>
                  <Clock className="w-5 h-5 text-[#2196F3]" />
                </div>
                <p className="text-3xl font-semibold">
                  {stats?.registrations.totalRegistrations}
                </p>
                <p className="text-sm text-muted-foreground">
                  Top events:{" "}
                  {stats?.registrations.topEventsByRegistration
                    .map((e) => e.name)
                    .join(", ")}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartLineLinear
                title="Daily User Logins"
                description="Number of users logged in per day this month"
                data={(stats?.users.dailyLogins || []).map((v, i) => ({
                  day: i + 1,
                  value: v,
                }))}
                color="var(--chart-1)"
              />

              <ChartLineLinear
                title="Daily Events Created"
                description="Number of events created per day this month"
                data={(stats?.events.dailyCreated || []).map((v, i) => ({
                  day: i + 1,
                  value: v,
                }))}
                color="var(--chart-2)"
              />

              <ChartLineLinear
                title="Daily Registrations"
                description="Number of registrations per day this month"
                data={(stats?.registrations.dailyRegistrations || []).map(
                  (v, i) => ({
                    day: i + 1,
                    value: v,
                  })
                )}
                color="var(--chart-3)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
