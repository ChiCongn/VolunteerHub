import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { useState, useEffect, useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  userStartsService,
  type MonthlyEventStats,
} from "@/services/user/user-stats.service";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function YearlyVolunteerActivityCard({
  className,
}: {
  className?: string;
}) {
  const [stats, setStats] = useState<MonthlyEventStats | null>(null);
  const [lastYearTotal, setLastYearTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch data for current year and previous year to calculate the difference
        const [thisYearData, lastYearData] = await Promise.all([
          userStartsService.getMonthlyParticipatedEvent(currentYear),
          userStartsService.getMonthlyParticipatedEvent(currentYear - 1),
        ]);

        setStats(thisYearData);

        const lastYearSum = lastYearData.monthlyCounts.reduce(
          (sum, m) => sum + m.joinedEvents,
          0
        );
        setLastYearTotal(lastYearSum);
      } catch (error) {
        console.error("Error fetching yearly stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentYear]);

  // Transform backend [1-12] data into Recharts format { month: "Jan", activities: X }
  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.monthlyCounts.map((item) => ({
      month: MONTH_NAMES[item.month - 1],
      activities: item.joinedEvents,
    }));
  }, [stats]);

  const totalThisYear = useMemo(
    () => chartData.reduce((sum, d) => sum + d.activities, 0),
    [chartData]
  );

  const diff = totalThisYear - lastYearTotal;
  const diffPercent =
    lastYearTotal > 0 ? Math.round((diff / lastYearTotal) * 100) : 100;
  const isIncrease = diff >= 0;

  if (loading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <div className="h-[400px] bg-muted/20 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader >
        <CardTitle className="text-base">
          Volunteer Activities ({currentYear})
        </CardTitle>
        <CardDescription>
          Number of volunteer events you joined this year
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="h-[260px] text-[var(--chart-1)]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 24, right: 16, left: 0, bottom: 24 }}
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={32}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-md bg-background px-3 py-2 shadow-md border border-border">
                        <div className="text-sm font-medium text-foreground">
                          {payload[0].payload.month}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payload[0].value} activities
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="activities"
                stroke="currentColor"
                strokeWidth={2}
                dot={{ r: 4, fill: "currentColor" }}
                activeDot={{ r: 6, fill: "currentColor" }}
              >
                <LabelList
                  dataKey="activities"
                  position="top"
                  fill="currentColor"
                  fontSize={12}
                  offset={8}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                isIncrease ? "text-green-600" : "text-destructive"
              }`}
            >
              {isIncrease ? "▲" : "▼"} {Math.abs(diff)} activities
            </span>
            <span className="text-sm text-muted-foreground">
              ({diffPercent > 0 && isIncrease ? "+" : ""}
              {diffPercent}%)
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Compared to last year ({currentYear - 1})
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">This year: </span>
              <span className="font-semibold text-foreground">
                {totalThisYear}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-sm">
              <span className="text-muted-foreground">Last year: </span>
              <span className="font-semibold text-foreground">
                {lastYearTotal}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
