import { useEffect, useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isAfter,
  subMonths,
  addMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { userStartsService, type LoginStreak } from "@/services/user/user-stats.service";

export default function StreakCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today));
  const [streakData, setStreakData] = useState<LoginStreak | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch data whenever currentMonth changes
  useEffect(() => {
    const fetchStreak = async () => {
      setIsLoading(true);
      try {
        const data = await userStartsService.getStreak();
        setStreakData(data);
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, [currentMonth]);

  // 2. Generate days for the current calendar view
  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      }),
    [currentMonth]
  );

  // 3. Helper to check if a date is in the activeDates from API
  const isActive = (day: Date) => {
    if (!streakData) return false;
    const dateStr = format(day, "yyyy-MM-dd");
    // activeDates from backend are strings like "2025-12-19T00:00:00.000Z"
    // or pure date strings. slice(0,10) ensures match.
    return streakData.activeDates.some((d) => d.startsWith(dateStr));
  };

  const isFutureMonth = isAfter(
    startOfMonth(addMonths(currentMonth, 1)),
    today
  );

  return (
    <Card className={isLoading ? "opacity-60 pointer-events-none" : ""}>
      <CardHeader>
        <CardTitle className="text-base">Volunteer Streak</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={isFutureMonth}
            className="rounded p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({
            length: (getDay(startOfMonth(currentMonth)) + 6) % 7,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const isToday = isSameDay(day, today);
            const isDayActive = isActive(day);

            let style = "bg-muted text-muted-foreground";
            if (isToday) {
              style = "bg-[var(--chart-1)] text-primary-foreground";
            } else if (isDayActive) {
              style = "bg-[var(--chart-4)] text-primary-foreground";
            }

            return (
              <div
                key={day.toISOString()}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${style} ${
                  isToday ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        {/* Real Stats Info */}
        <div className="flex justify-between text-sm pt-2 border-t">
          <span>🔥 Days active this month</span>
          <span className="font-bold">
            {streakData?.activeDates.length || 0} days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
