"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  userStartsService,
  type WeeklyEventParticipation,
} from "@/services/user/user-stats.service";

export default function WeeklyVolunteerGoalChart() {
  const [data, setData] = useState<WeeklyEventParticipation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyParticipation = async () => {
      try {
        setIsLoading(true);
        const result = await userStartsService.getWeeklyEventParticipation();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch weekly participation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyParticipation();
  }, []);

  // Calculate derived values based on API response
  const completed = data?.joinedEvents ?? 0;
  const goal = data?.target ?? 10; // Fallback to 10 if target is not defined
  const remaining = Math.max(goal - completed, 0);
  const percentage = data?.progressPercent ?? 0;

  const pieData = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="h-[120px] w-[120px] rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Volunteer Goal</CardTitle>
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
                paddingAngle={completed === 0 || remaining === 0 ? 0 : 3}
                startAngle={90}
                endAngle={-270}
              >
                <Cell
                  className="text-[hsl(var(--chart-1))]"
                  fill="currentColor"
                />
                <Cell className="text-muted" fill="currentColor" />
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
            <span className="font-medium text-foreground">{completed}</span> /{" "}
            {goal} events joined
          </div>

          <div className="text-sm text-muted-foreground">
            {remaining > 0
              ? `${remaining} events remaining this week`
              : "Weekly goal reached! Amazing job 🌟"}
          </div>

          <p className="text-xs text-muted-foreground">
            {percentage >= 100
              ? "You've exceeded your target. Keep making an impact!"
              : "Stay active and contribute to community events 🌱"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
