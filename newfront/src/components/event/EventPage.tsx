import { useState, useMemo, useEffect } from "react";
import type { Event } from "@/types/event.type";
import { EventCategory, EventStatus } from "@/types/enum";
import { CATEGORY_FILTERS, STATUS_FILTERS } from "./EventFilter";
import EventGrid from "./EventGird";
import { eventService } from "../../services/event.service";
import { Loader2, AlertCircle } from "lucide-react";
type Props = {
  events: Event[];
};

export default function EventPage() {
  // state cho dữ liệu từ API
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");

  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">(
    "all"
  );

  //api
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventService.getEvents();

        const formattedEvents: Event[] = response.items.map(
          (item: any) => ({
            ...item,
            startTime: new Date(item.startTime),
            endTime: item.endTime ? new Date(item.endTime) : null,
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          })
        );

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Không thể tải danh sách sự kiện. Vui lòng thử lại!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);


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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Đang tải sự kiện...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive space-y-2">
        <AlertCircle className="h-10 w-10" />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline text-blue-500"
        >
          Thử lại
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/*Header Section*/}
      <div className="flex flex-col items-center text-center py-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Discover Events That Make a Difference
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Explore opportunities to learn, connect, and make a positive impact in
          your community.
        </p>
      </div>

      {/* Category Filter */}
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

      {/* Status Filters */}
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
