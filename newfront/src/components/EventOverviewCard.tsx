"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react";

/* === MOCK DATA === */
const MOCK_POSTS_PER_DAY = [
  { day: "M", posts: 2 },
  { day: "T", posts: 5 },
  { day: "W", posts: 3 },
  { day: "T", posts: 6 },
  { day: "F", posts: 4 },
  { day: "S", posts: 7 },
  { day: "S", posts: 1 },
];

const MOCK_JOINED = 32;
const MOCK_CAPACITY = 50;

/* Event progress mock */
const INITIAL_PROGRESS = 65;

export default function EventOverviewCard() {
  const remaining = Math.max(MOCK_CAPACITY - MOCK_JOINED, 0);
  const percent = Math.round((MOCK_JOINED / MOCK_CAPACITY) * 100);

  /* ===== PROGRESS STATE ===== */
  const [progressPercent, setProgressPercent] =
    useState<number>(INITIAL_PROGRESS);
  const [inputValue, setInputValue] = useState<string>(
    String(INITIAL_PROGRESS)
  );

  const participantPie = useMemo(
    () => [
      { name: "Joined", value: MOCK_JOINED },
      { name: "Remaining", value: remaining },
    ],
    [remaining]
  );

  const progressPie = useMemo(
    () => [
      { name: "Completed", value: progressPercent },
      { name: "Remaining", value: 100 - progressPercent },
    ],
    [progressPercent]
  );

  const handleProgressEnter = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      let value = Number(inputValue);
      if (isNaN(value)) return;

      value = Math.max(0, Math.min(100, value));
      setProgressPercent(value);
      setInputValue(String(value));
    }
  };

  const handleExport = () => {
    console.log("EXPORT VOLUNTEERS LIST");
  };

  const handleMarkCompleted = () => {
    console.log("EVENT MARKED AS COMPLETED");
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Event Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* ===== LEFT: POSTS + PROGRESS ===== */}
          <div className="space-y-4">
            {/* Posts activity */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Posts activity (last 7 days)
              </p>

              <div className="h-[120px] text-[hsl(var(--chart-1))]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_POSTS_PER_DAY}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-md bg-background px-2 py-1 text-xs border shadow">
                            {payload[0].value} posts
                          </div>
                        ) : null
                      }
                    />

                    <Bar dataKey="posts" radius={[4, 4, 0, 0]} fill="currentColor">
                      <LabelList
                        dataKey="posts"
                        position="top"
                        fontSize={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event progress (editable) */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Event progress
              </p>

              <div className="flex flex-col items-center gap-2">
                <div className="relative h-[110px] w-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressPie}
                        dataKey="value"
                        innerRadius={40}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="hsl(var(--chart-2))" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {progressPercent}%
                  </div>
                </div>

                {/* INPUT */}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleProgressEnter}
                  className="w-20 text-center text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <span className="text-[10px] text-muted-foreground">
                  Press Enter to update
                </span>

                {/* ✅ COMPLETE BUTTON */}
                {progressPercent === 100 && (
                  <Button
                    size="sm"
                    className="mt-2 w-full flex items-center gap-2"
                    onClick={handleMarkCompleted}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ===== RIGHT: PARTICIPANTS ===== */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Participants vs Capacity
            </p>

            <div className="flex flex-col items-center">
              <div className="relative h-[120px] w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={participantPie}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={58}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={remaining === 0 ? 0 : 3}
                    >
                      <Cell fill="hsl(var(--chart-1))" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{percent}%</span>
                  <span className="text-[10px] text-muted-foreground">
                    filled
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center text-xs">
                <div className="font-medium">
                  {MOCK_JOINED} / {MOCK_CAPACITY} participants
                </div>
                <div className="text-muted-foreground">
                  {remaining} slots remaining
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== EXPORT BUTTON ===== */}
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2 justify-center"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export volunteer list
        </Button>
      </CardContent>
    </Card>
  );
}
