"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  managerStatsService,
  type ManagerMonthlyCompletedStats,
} from "@/services/user/manager-stats.service";
import { toast } from "sonner";

/* ================= MOCK DATA ================= */

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

// Completed events per month (current year)
const mockThisYear = [2, 3, 4, 5, 6, 8, 10, 9, 7, 6, 5, 4];

// Completed events per month (last year)
const mockLastYear = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2];

/* ============================================= */

export default function YearlyCompletedEventsCard({
  className,
}: {
  className?: string;
}) {
  const currentYear = new Date().getFullYear();
  const [thisYearData, setThisYearData] = useState<
    ManagerMonthlyCompletedStats[]
  >([]);
  const [lastYearData, setLastYearData] = useState<
    ManagerMonthlyCompletedStats[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data for both years in parallel
        const [thisYear, lastYear] = await Promise.all([
          managerStatsService.getMonthlyCompleted(currentYear),
          managerStatsService.getMonthlyCompleted(currentYear - 1),
        ]);
        setThisYearData(thisYear);
        setLastYearData(lastYear);
      } catch (error) {
        toast.error("Failed to fetch yearly stats");
        console.error("Failed to fetch yearly stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear]);

  // Map mock data → Recharts format
  const chartData = useMemo(() => {
    return thisYearData.map((item) => ({
      month: item.month.substring(0, 3), // Shorten "January" to "Jan" for UI
      completed: item.count,
    }));
  }, [thisYearData]);

  const totalThisYear = useMemo(
    () => thisYearData.reduce((sum, v) => sum + v.count, 0),
    [thisYearData]
  );

  const lastYearTotal = useMemo(
    () => lastYearData.reduce((sum, v) => sum + v.count, 0),
    [lastYearData]
  );

  const diff = totalThisYear - lastYearTotal;
  const diffPercent =
    lastYearTotal > 0 ? Math.round((diff / lastYearTotal) * 100) : 100;
  const isIncrease = diff >= 0;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-10 text-center">
          Loading stats...
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          Completed Events ({currentYear})
        </CardTitle>
        <CardDescription>Number of completed events per month</CardDescription>
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
                          {payload[0].value} completed events
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="completed"
                stroke="currentColor"
                strokeWidth={2}
                dot={{ r: 4, fill: "currentColor" }}
                activeDot={{ r: 6, fill: "currentColor" }}
              >
                <LabelList
                  dataKey="completed"
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
              {isIncrease ? "▲" : "▼"} {Math.abs(diff)} events
            </span>
            <span className="text-sm text-muted-foreground">
              ({isIncrease && diffPercent > 0 ? "+" : ""}
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
