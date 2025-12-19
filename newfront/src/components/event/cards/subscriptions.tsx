"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  LabelList,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const mockEventStatusStats = {
  approved: 12,
  pending: 5,
  completed: 18,
  rejected: 3,
};


export default function EventStatusOverviewCard() {
  const chartData = useMemo(() => {
    return [
      { status: "Approved", value: mockEventStatusStats.approved },
      { status: "Pending", value: mockEventStatusStats.pending },
      { status: "Completed", value: mockEventStatusStats.completed },
      { status: "Rejected", value: mockEventStatusStats.rejected },
    ];
  }, []);

  const totalEvents =
    mockEventStatusStats.approved +
    mockEventStatusStats.pending +
    mockEventStatusStats.completed +
    mockEventStatusStats.rejected;

  return (
    <Card className="bg-white">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Event Status Overview
          </CardTitle>

          <div className="text-3xl font-bold leading-none">
            {totalEvents}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              events
            </span>
          </div>
        </div>

        <p className="text-xs mt-1 font-medium text-muted-foreground">
          Distribution of events by status
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
                dataKey="status"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const status = payload[0].payload.status;
                    const value = payload[0].value;

                    return (
                      <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-md border border-border">
                        <span className="h-2 w-2 rounded-sm bg-current" />
                        <span className="text-xs text-muted-foreground">
                          {status}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {value} events
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="currentColor">
                <LabelList
                  dataKey="value"
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
