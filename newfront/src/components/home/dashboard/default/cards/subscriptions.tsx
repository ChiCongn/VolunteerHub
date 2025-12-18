"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  LabelList,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ================= MOCK DATA ================= */

interface VolunteerProgressData {
  day: string;
  hours: number;
}

const MOCK_DATA: VolunteerProgressData[] = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 2 },
  { day: "Sat", hours: 5 },
  { day: "Sun", hours: 3 },
];

const TOTAL_THIS_WEEK = MOCK_DATA.reduce(
  (sum, d) => sum + d.hours,
  0
);

const TOTAL_LAST_WEEK = 16;

/* ============================================= */

export default function VolunteerProgressCard() {
  const percentChange =
    TOTAL_LAST_WEEK > 0
      ? Math.round(
          ((TOTAL_THIS_WEEK - TOTAL_LAST_WEEK) /
            TOTAL_LAST_WEEK) *
            100
        )
      : 0;

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Volunteer Hours (7 days)
          </CardTitle>

          <div className="text-3xl font-bold leading-none">
            {TOTAL_THIS_WEEK}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              hrs
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {percentChange > 0 ? "+" : ""}
          {percentChange}% compared to last week
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[120px] text-[hsl(var(--chart-1))]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MOCK_DATA}
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

              <Bar
                dataKey="hours"
                radius={[6, 6, 0, 0]}
                fill="currentColor"
              >
                <LabelList
                  dataKey="hours"
                  position="top"
                  fill="currentColor"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
