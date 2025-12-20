import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy } from "lucide-react";
import { EventCategory, EventStatus } from "@/types/enum";
import { FilterEventBar } from "@/components/FilterEventBar";
import type { Event } from "@/types/event.type";
import {
  eventManagementService,
  type EventsStats,
} from "@/services/admin/event-management.service";
import { useDebounce } from "@/hooks/useDebounce";
import { FilterEventsStatsBar } from "@/components/FilterEventsStatsBar";

export function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // fixed page size
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // filter
  const [search, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(
    EventStatus.Pending
  );

  // stats
  // stats filters
  const [statsRange, setStatsRange] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [selectedCategoryStats, setSelectedCategoryStats] = useState<
    EventCategory | "all"
  >("all");
  const [selectedStatusStats, setSelectedStatusStats] = useState<EventStatus>(
    EventStatus.Pending
  );

  const [stats, setStats] = useState<EventsStats | null>(null);

  // =========== service ===============
  const debouncedSearch = useDebounce(search, 400);
  // fetch/filter events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await eventManagementService.listEvents({
          name: debouncedSearch || undefined,
          status: selectedStatus,
          categories:
            selectedCategory === "all" ? undefined : [selectedCategory],
        });

        setEvents(res.items);
        setTotalItems(res.total);
        setTotalPages(Math.ceil(res.total / limit));
      } catch (error) {
        console.error("Fetch events failed", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, limit, debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 30);

    setStatsRange({
      from: from.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    });
  }, []);

  // fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await eventManagementService.getEventsStats({
          range:
            statsRange.from || statsRange.to
              ? {
                  from: statsRange.from!,
                  to: statsRange.to!,
                }
              : undefined,

          status: selectedStatusStats ? [selectedStatusStats] : undefined,

          categories:
            selectedCategoryStats === "all"
              ? undefined
              : [selectedCategoryStats],
        });

        setStats(stats);
      } catch (error) {
        console.error("Fetch stats failed", error);
      }
    };
    console.log("fetch stats");
    fetchStats();
  }, [
    selectedCategoryStats,
    selectedStatusStats,
    statsRange.from,
    statsRange.to,
  ]);

  const handleCategoryStatsChange = (category: EventCategory | "all") => {
    console.log(stats);
    setSelectedCategoryStats(category);
  };

  const handleStatusStatsChange = (status: EventStatus) => {
    setSelectedStatusStats(status);
  };

  // ========= filter handles =================
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // reset pagination when filter changes
  };

  const handleCategoryChange = (category: EventCategory | "all") => {
    setSelectedCategory(category);
    setPage(1); // reset pagination when filter changes
  };

  const handleStatusChange = (status: EventStatus) => {
    setSelectedStatus(status);
    setPage(1); // reset pagination when filter changes
  };

  // ======= approve/reject ==========
  const handleApproveEvent = async (eventId: string) => {
    try {
      await eventManagementService.approveEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: "approved" } : e))
      );
      //toast.success("Event approved successfully");
    } catch (err) {
      console.error(err);
      //toast.error("Failed to approve event");
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      await eventManagementService.rejectEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e))
      );
      //toast.success("Event rejected successfully");
    } catch (err) {
      console.error(err);
      //toast.error("Failed to reject event");
    }
  };

  // =========== export data =====================
  const exportEventsToCSV = () => {
    if (!events.length) return;

    // Build CSV headers
    const headers = [
      "ID",
      "Name",
      "Location",
      "Status",
      "Capacity",
      "Start Time",
      "End Time",
      "Categories",
    ];

    const rows = events.map((e) => [
      e.id,
      e.name,
      e.location,
      e.status,
      e.capacity,
      e.startTime ? new Date(e.startTime).toLocaleString() : "",
      e.endTime ? new Date(e.endTime).toLocaleString() : "",
      e.categories?.join(", ") || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportEventsToJSON = () => {
    if (!events.length) return;

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(events, null, 2));

    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "events.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter((p) => Math.abs(p - page) <= 2);

  return (
    <div className="min-h-screen bg-[#dae0e6] dark:bg-black">
      <div className="flex w-full justify-center">
        <div className="flex flex-1 justify-center min-w-0">
          <div className="space-y-6 w-full max-w-6xl p-6">
            <div>
              <h1 className="text-2xl font-semibold">Event Management</h1>
              <p className="text-muted-foreground">Manage event</p>
            </div>

            <FilterEventsStatsBar
              selectedCategory={selectedCategoryStats}
              selectedStatus={selectedStatusStats}
              onCategoryChange={handleCategoryStatsChange}
              onStatusChange={handleStatusStatsChange}
              onRangeChange={(range) =>
                setStatsRange((prev) => ({ ...prev, ...range }))
              }
            />

            {/* stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <Calendar className="w-5 h-5 text-[#43A047]" />
                </div>
                <p className="text-3xl font-semibold">
                  {stats?.totalEvents ?? 0}
                </p>
              </div>
              {/* <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Ongoing Events
                  </p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">{stats?.activeEvents}</p>
                <p className="text-xs text-[#FFC107]">Top 15% of volunteers</p>
              </div> */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Completed Events
                  </p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {stats?.completedEvents}
                </p>
                <p className="text-xs text-[#FFC107]">.....</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <Clock className="w-5 h-5 text-[#2196F3]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-semibold leading-none">
                      {stats?.participants.total ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold leading-none">
                      {stats?.participants.average ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold leading-none">
                      {stats?.participants.median ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Median</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Posts</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-semibold leading-none">
                      {stats?.totalPosts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>

                  <div>
                    <p className="text-3xl font-semibold leading-none">
                      {stats?.avgPostsPerEvent}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={exportEventsToCSV}>Export Events</Button>
              <Button onClick={exportEventsToJSON}>Export Events (JSON)</Button>
            </div>

            <FilterEventBar
              onSearch={handleSearch}
              onCategoryChange={handleCategoryChange}
              onStatusChange={handleStatusChange}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
            />

            {/* table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        {/* Event name */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{event.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ID: {event.id.slice(0, 8)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              event.status === EventStatus.Approved
                                ? "text-green-600"
                                : event.status === EventStatus.Pending
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>

                        {/* Start time */}
                        <TableCell>
                          {new Date(event.startTime).toLocaleString()}
                        </TableCell>

                        {/* Location */}
                        <TableCell className="max-w-[200px] truncate">
                          {event.location}
                        </TableCell>

                        {/* Categories */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {event.categories.slice(0, 2).map((cat) => (
                              <Badge key={cat} variant="secondary">
                                {cat}
                              </Badge>
                            ))}
                            {event.categories.length > 2 && (
                              <Badge variant="outline">
                                +{event.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>

                            {event.status === EventStatus.Pending && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveEvent(event.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectEvent(event.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* pagination */}
            <Pagination className="py-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    isActive={page !== 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  />
                </PaginationItem>

                {visiblePages.map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    isActive={page !== totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
