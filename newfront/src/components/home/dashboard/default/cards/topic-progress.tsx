"use client";

import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WEEKLY_GOAL = 10;
const COMPLETED_EVENTS = 6; 
export default function WeeklyVolunteerGoalChart() {
  const remainingEvents = Math.max(
    WEEKLY_GOAL - COMPLETED_EVENTS,
    0
  );

  const percentage = Math.round(
    (COMPLETED_EVENTS / WEEKLY_GOAL) * 100
  );

  const pieData = [
    { name: "Completed", value: COMPLETED_EVENTS },
    { name: "Remaining", value: remainingEvents },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Weekly Volunteer Goal
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-6">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={40}
                outerRadius={55}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                <Cell
                  className="text-[hsl(var(--chart-1))]"
                  fill="currentColor"
                />
                <Cell
                  className="text-muted"
                  fill="currentColor"
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-foreground">
              {percentage}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              of weekly goal
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-foreground">
              {COMPLETED_EVENTS}
            </span>{" "}
            / {WEEKLY_GOAL} events joined
          </div>

          <div className="text-sm text-muted-foreground">
            {remainingEvents} events remaining this week
          </div>

          <p className="text-xs text-muted-foreground">
            Stay active and contribute to community events 🌱
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
