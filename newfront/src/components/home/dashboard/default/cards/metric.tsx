import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MonthlyVolunteerData = {
  month: string;
  activities: number;
};

/* ================= MOCK DATA ================= */
// 12 tháng – số lần đi tình nguyện
const MOCK_DATA: MonthlyVolunteerData[] = [
  { month: "Jan", activities: 2 },
  { month: "Feb", activities: 3 },
  { month: "Mar", activities: 1 },
  { month: "Apr", activities: 4 },
  { month: "May", activities: 2 },
  { month: "Jun", activities: 5 },
  { month: "Jul", activities: 3 },
  { month: "Aug", activities: 4 },
  { month: "Sep", activities: 2 },
  { month: "Oct", activities: 5 },
  { month: "Nov", activities: 3 },
  { month: "Dec", activities: 4 },
];

// Tổng số hoạt động năm trước (mock)
const LAST_YEAR_TOTAL = 30;
/* ============================================= */

export default function YearlyVolunteerActivityCard({
  className,
}: {
  className?: string;
}) {
  const [data] = useState<MonthlyVolunteerData[]>(MOCK_DATA);
  const [lastYearTotal] = useState(LAST_YEAR_TOTAL);

  const totalThisYear = data.reduce((sum, d) => sum + d.activities, 0);

  const diff = totalThisYear - lastYearTotal;
  const diffPercent =
    lastYearTotal > 0 ? Math.round((diff / lastYearTotal) * 100) : 0;

  const isIncrease = diff >= 0;

  return (
    <Card className={className} className="bg-white">
      <CardHeader>
        <CardTitle className="text-base">
          Volunteer Activities (Yearly)
        </CardTitle>
        <CardDescription>
          Number of volunteer events you joined this year
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="h-[260px] text-muted-foreground">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 24,
                right: 16,
                left: 0,
                bottom: 24,
              }}
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
                cursor={{
                  stroke: "hsl(var(--border))",
                }}
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
                activeDot={{
                  r: 6,
                  fill: "currentColor",
                }}
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

        {/* ===== Summary ===== */}
        <div className="mt-6 space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                isIncrease ? "text-success" : "text-destructive"
              }`}
            >
              {isIncrease ? "▲" : "▼"} {Math.abs(diff)} activities
            </span>
            <span className="text-sm text-muted-foreground">
              ({diffPercent > 0 ? "+" : ""}
              {diffPercent}%)
            </span>
          </div>

          <p className="text-sm text-muted-foreground">Compared to last year</p>

          <div className="flex items-center gap-4 pt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">This year: </span>
              <span className="font-semibold text-foreground">
                {totalThisYear} activities
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="text-sm">
              <span className="text-muted-foreground">Last year: </span>
              <span className="font-semibold text-foreground">
                {lastYearTotal} activities
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
