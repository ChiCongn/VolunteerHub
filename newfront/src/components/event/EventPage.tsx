import { useState, useMemo, useEffect } from "react";
import type { Event } from "@/types/event.type";
import { EventCategory, EventStatus } from "@/types/enum";
import { CATEGORY_FILTERS, STATUS_FILTERS } from "./EventFilter";
import EventGrid from "./EventGird";
import { eventService } from "../../services/event.service";
import { Loader2, AlertCircle } from "lucide-react";
import { FilterEventBarForComunity } from "../EventFilterBarForComunity";
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

  const [searchText, setSearchText] = useState<string>("");
  
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
  const keyword = searchText.trim().toLowerCase();

  return events.filter((event) => {
    // Category
    const matchCategory =
      selectedCategory === "all" ||
      event.categories.includes(selectedCategory);

    // Status
    const matchStatus =
      selectedStatus === "all" || event.status === selectedStatus;

    // Search (title + description)
    const matchSearch =
      keyword === "" ||
      event.name.toLowerCase().includes(keyword) ||
      event.description?.toLowerCase().includes(keyword);

    return matchCategory && matchStatus && matchSearch;
  });
}, [events, selectedCategory, selectedStatus, searchText]);


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

    <FilterEventBarForComunity
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
        onSearch={setSearchText}
      />
      
      <EventGrid events={filteredEvents} />
    </div>
  );
}
