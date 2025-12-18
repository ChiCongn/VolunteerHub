import { useState, useMemo } from "react";
import type { Event as EventData } from "@/types/event.type";
import { EventCategory, EventStatus } from "@/types/enum";
import { CATEGORY_FILTERS, STATUS_FILTERS } from "./EventFilter";
import EventGrid from "./EventGird";

type Props = {
  events: EventData[];
};

export default function EventPage({ events }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");

  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">(
    "all"
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchCategory =
        selectedCategory === "all" ||
        event.categories.includes(selectedCategory);

      const matchStatus =
        selectedStatus === "all" || event.status === selectedStatus;

      return matchCategory && matchStatus;
    });
  }, [events, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center py-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Discover Events That Make a Difference
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Explore opportunities to learn, connect, and make a positive impact in
          your community.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c.value}
            onClick={() =>
              setSelectedCategory(c.value as EventCategory | "all")
            }
            className={`px-3 py-1.5 rounded-full text-sm border transition
              ${
                selectedCategory === c.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSelectedStatus(s.value as EventStatus | "all")}
            className={`px-3 py-1.5 rounded-full text-sm border transition
              ${
                selectedStatus === s.value
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <EventGrid events={filteredEvents} />
    </div>
  );
}
