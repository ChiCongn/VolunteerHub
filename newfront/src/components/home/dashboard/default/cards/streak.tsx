"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isSameDay,
  startOfMonth,
  subDays,
  addMonths,
  subMonths,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export default function StreakCalendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(today)
  );

  const last4Days = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) =>
        subDays(today, i + 1)
      ),
    [today]
  );

  const mockOldStreakDays = useMemo(
    () => [
      subDays(today, 7),
      subDays(today, 9),
      subDays(today, 10),
      subDays(today, 13),
      subDays(today, 15),
      subDays(today, 18),
    ],
    [today]
  );

  const CURRENT_STREAK = 5;
  const LONGEST_STREAK = 21;


  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isFutureMonth = isAfter(
    startOfMonth(addMonths(currentMonth, 1)),
    today
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Volunteer Streak
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ===== Month navigation ===== */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentMonth(subMonths(currentMonth, 1))
            }
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>

          <button
            onClick={() =>
              setCurrentMonth(addMonths(currentMonth, 1))
            }
            disabled={isFutureMonth}
            className="rounded p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ===== Weekday labels ===== */}
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* ===== Calendar days ===== */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells */}
          {Array.from({
            length:
              (getDay(startOfMonth(currentMonth)) + 6) %
              7,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const isToday = isSameDay(day, today);
            const isFuture = isAfter(day, today);

            let style =
              "bg-muted text-muted-foreground";

            // 🔵 Today
            if (isToday) {
              style =
                "bg-[var(--chart-1)] text-primary-foreground";
            }

            // 🟢 4 ngày gần nhất
            else if (
              last4Days.some((d) => isSameDay(d, day))
            ) {
              style =
                "bg-[var(--chart-4)] text-primary-foreground";
            }

            // 🟢 Các ngày streak cũ (mock)
            else if (
              !isFuture &&
              mockOldStreakDays.some((d) =>
                isSameDay(d, day)
              )
            ) {
              style =
                "bg-[var(--chart-4)] text-primary-foreground";
            }

            return (
              <div
                key={day.toISOString()}
                className={`flex h-9 w-9 items-center justify-center
                rounded-full text-sm font-medium
                transition-colors duration-200
                ${style}
                ${
                  isToday
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }
              `}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        {/* ===== Mock info ===== */}
        <div className="flex justify-between text-sm pt-2">
          <span>🔥 Current streak</span>
          <span className="font-bold">
            {CURRENT_STREAK} days
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>🏆 Longest streak</span>
          <span className="font-bold">
            {LONGEST_STREAK} days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
