"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Clock } from "lucide-react";
import { eventService, type DailyPost } from "@/services/event.service";
import type { Event } from "@/types/event.type";

interface EventStatsProps {
  event: Event;
}

export default function EventOverviewCard({
  event,
}: EventStatsProps) {
  const [dailyPosts, setDailyPosts] = useState<DailyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventPostsStats(event.id, 7);
        setDailyPosts(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [event.id]);

  const progressPercent = useMemo(() => {
    const now = new Date().getTime();
    const start = new Date(event.startTime).getTime();
    const end = event.endTime ? new Date(event.endTime).getTime() : null;

    if (!end || now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  }, [event.startTime, event.endTime]);

  const postData = useMemo(() => {
    return dailyPosts.map((d) => ({
      day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
      posts: d.postCount,
    }));
  }, [dailyPosts]);

  const { targetParticipants, actualParticipants } = {
    targetParticipants: event.capacity || 1,
    actualParticipants: event.registerCount || 0,
  };

  const remaining = Math.max(targetParticipants - actualParticipants, 0);
  const fillPercent = Math.round(
    (actualParticipants / targetParticipants) * 100
  );

  const participantPie = useMemo(
    () => [
      { name: "Joined", value: actualParticipants },
      { name: "Remaining", value: remaining },
    ],
    [actualParticipants, remaining]
  );

  const progressPie = useMemo(
    () => [
      { name: "Elapsed", value: progressPercent },
      { name: "Remaining", value: 100 - progressPercent },
    ],
    [progressPercent]
  );

  if (loading)
    return (
      <div className="p-10 text-center text-sm text-zinc-500">
        Loading Stats...
      </div>
    );

  const handleExport = () => console.log("EXPORT VOLUNTEERS LIST");

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2 border-b mb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" />
          Event Insights
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* LEFT: POSTS + TIME PROGRESS */}
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Post Activity (7D)
              </p>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postData}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && (
                          <div className="bg-zinc-900 text-white px-2 py-1 text-[10px] rounded shadow-lg">
                            {payload?.[0].value} posts
                          </div>
                        )
                      }
                    />
                    <Bar dataKey="posts" radius={[2, 2, 0, 0]} fill="#18181b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Timeline
              </p>
              <div className="flex flex-col items-center">
                <div className="relative h-[100px] w-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressPie}
                        dataKey="value"
                        innerRadius={35}
                        outerRadius={45}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f4f4f5" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {progressPercent}%
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1">
                  {progressPercent === 100 ? "Event Finished" : "In Progress"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: PARTICIPANTS */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Capacity
            </p>
            <div className="flex flex-col items-center">
              <div className="relative h-[120px] w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={participantPie}
                      dataKey="value"
                      innerRadius={40}
                      outerRadius={52}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f4f4f5" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{fillPercent}%</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-medium">
                    Full
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-xs font-bold">
                  {actualParticipants} / {targetParticipants}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {remaining} spots left
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-2 font-medium border-zinc-200 hover:bg-zinc-50"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export Volunteer Data
        </Button>
      </CardContent>
    </Card>
  );
}
