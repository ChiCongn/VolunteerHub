"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  LabelList,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  userStartsService,
  type WeeklyOnlineStats,
} from "@/services/user/user-stats.service";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function VolunteerProgressCard() {
  const [stats, setStats] = useState<WeeklyOnlineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const result = await userStartsService.getWeeklyOnline();
        setStats(result);
      } catch (error) {
        console.error("Failed to fetch weekly online stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Map the array of 7 numbers from backend to Recharts format
  const chartData = useMemo(() => {
    if (!stats) return [];
    console.log(stats.currentWeek);

    return stats.currentWeek.dailyHours.map((hours, index) => ({
      day: DAY_LABELS[index],
      hours: hours,
    }));
  }, [stats]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-1">
          <div className="flex justify-between">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent className="h-[120px] pt-2">
          <div className="h-full w-full bg-muted/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  const totalThisWeek = stats?.currentWeek.totalHours ?? 0;
  const percentChange = stats?.comparePercent ?? 0;

  return (
    <Card className="bg-white">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Volunteer Hours (7 days)</CardTitle>

          <div className="text-3xl font-bold leading-none">
            {totalThisWeek}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              hrs
            </span>
          </div>
        </div>

        <p
          className={`text-xs mt-1 font-medium ${
            percentChange >= 0 ? "text-green-600" : "text-destructive"
          }`}
        >
          {percentChange > 0 ? "+" : ""}
          {percentChange}% compared to last week
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[120px] text-[hsl(var(--chart-1))]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const day = payload[0].payload.day;
                    const value = payload[0].value;

                    return (
                      <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-md border border-border">
                        <span className="h-2 w-2 rounded-sm bg-current" />
                        <span className="text-xs text-muted-foreground">
                          {day}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {value} hrs
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="currentColor">
                <LabelList
                  dataKey="hours"
                  position="top"
                  fill="currentColor"
                  fontSize={12}
                  formatter={(val: number) => (val > 0 ? val : "")}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
