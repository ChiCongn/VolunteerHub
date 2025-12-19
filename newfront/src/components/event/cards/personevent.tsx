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


const mockParticipantsPerEvent = [
  { name: "Community Cleanup", participants: 45 },
  { name: "Health Workshop", participants: 30 },
  { name: "Tech for Kids", participants: 60 },
  { name: "Education Fair", participants: 52 },
  { name: "Charity Run", participants: 80 },
];


export default function ParticipantsPerEventCard() {
  const chartData = useMemo(() => {
    return mockParticipantsPerEvent;
  }, []);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Participants per Event
          </CardTitle>
        </div>

        <p className="text-xs mt-1 font-medium text-muted-foreground">
          Number of participants for each event
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[180px] text-[hsl(var(--chart-1))]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 8, left: 8, bottom: 24 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />

              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const eventName = payload[0].payload.name;
                    const value = payload[0].value;

                    return (
                      <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-md border border-border">
                        <span className="h-2 w-2 rounded-sm bg-current" />
                        <span className="text-xs text-muted-foreground">
                          {eventName}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {value} participants
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="participants" radius={[4, 4, 0, 0]} fill="currentColor">
                <LabelList
                  dataKey="participants"
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
