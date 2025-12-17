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
import { Navbar05 } from "../navbar";
import LeftPanel from "@/components/LeftPanel";
import { EventCategory, EventStatus } from "@/types/enum";
import { FilterEventBar } from "@/components/FilterEventBar";
import type { Event } from "@/types/event.type";

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

  // =========== service ===============
  // fetch/filter users
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
      } catch (error) {
        console.error("Fetch users failed", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, limit]);

  // fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
      } catch (error) {
        console.error("Fetch stats failed", error);
      }
    };

    fetchStats();
  }, []);

  // ========= filter handles =================
  const handleSearch = (username: string) => {
    if (!username || username === "") return;

    setPage(1); // reset pagination when filter changes
  };

  const handleCategoryChange = (category: EventCategory | "all") => {
    setPage(1); // reset pagination when filter changes
  };

  const handleStatusChange = (status: EventStatus) => {
    setPage(1); // reset pagination when filter changes
  };

  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter((p) => Math.abs(p - page) <= 2);

  return (
    <div className="min-h-screen bg-[#dae0e6] dark:bg-black">
      <Navbar05 />

      <div className="flex w-full justify-center">
        <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] z-30 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <LeftPanel />
        </div>

        <div className="flex flex-1 justify-center min-w-0">
          <div className="space-y-6 w-full max-w-6xl p-6">
            <div>
              <h1 className="text-2xl font-semibold">Event Management</h1>
              <p className="text-muted-foreground">Manage event</p>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <Calendar className="w-5 h-5 text-[#43A047]" />
                </div>
                <p className="text-3xl font-semibold">{20}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Ongoing Events
                  </p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">{20}</p>
                <p className="text-xs text-[#FFC107]">Top 15% of volunteers</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Completed Events
                  </p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">{20}</p>
                <p className="text-xs text-[#FFC107]">.....</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <Clock className="w-5 h-5 text-[#2196F3]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-semibold leading-none">20</p>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold leading-none">20</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold leading-none">20</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Median
                    </p>
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
                    <p className="text-3xl font-semibold leading-none">20</p>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>

                  <div>
                    <p className="text-3xl font-semibold leading-none">20</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average
                    </p>
                  </div>
                </div>
              </div>
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
                                <Button size="sm" variant="default">
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive">
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
