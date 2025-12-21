import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Event } from "@/types/event.type";
import { EventStatus } from "@/types/enum";
import { eventService } from "@/services/event.service";
import { useAuthState } from "@/hooks/useAuthState";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/utils/imageUrl.utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EventPageForManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthState();

  // Filter states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">(
    "all"
  );
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const res = await eventService.getEvents();
        // Filter only events of current manager
        const managerEvents = res.items.filter(
          (event) => event.ownerId === user.id
        );
        setEvents(managerEvents);
      } catch (err) {
        console.error("Fetch events failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id]);

  // Filter events based on search, status, and limit
  const filteredEvents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return events
      .filter((event) => {
        // Search by name
        const matchSearch =
          keyword === "" || event.name.toLowerCase().includes(keyword);

        // Filter by status
        const matchStatus =
          selectedStatus === "all" || event.status === selectedStatus;

        return matchSearch && matchStatus;
      })
      .slice(0, limit);
  }, [events, searchText, selectedStatus, limit]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Manage Your Events Here!</h1>
        <p className="text-muted-foreground">Manage events you have created</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events by name..."
              className="pl-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as EventStatus | "all")
              }
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={EventStatus.Pending}>Pending</SelectItem>
                <SelectItem value={EventStatus.Approved}>Approved</SelectItem>
                <SelectItem value={EventStatus.Rejected}>Rejected</SelectItem>
                <SelectItem value={EventStatus.Ongoing}>Ongoing</SelectItem>
                <SelectItem value={EventStatus.Completed}>Completed</SelectItem>
                <SelectItem value={EventStatus.Cancelled}>Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Limit */}
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v))}
            >
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">View</TableHead>
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
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No matching events
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event, index) => (
                <TableRow key={event.id}>
                  {/* STT */}
                  <TableCell>{index + 1}</TableCell>

                  {/* Start Date */}
                  <TableCell>
                    {new Date(event.startTime).toLocaleDateString()}
                  </TableCell>

                  {/* Ảnh */}
                  <TableCell>
                    <img
                      src={getImageUrl(event.imageUrl)}
                      alt={event.name}
                      className="h-16 w-24 object-contain rounded-md border"
                    />
                  </TableCell>

                  {/* Tên */}
                  <TableCell className="font-medium">{event.name}</TableCell>

                  {/* Trạng thái */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        event.status === EventStatus.Approved
                          ? "text-green-600"
                          : event.status === EventStatus.Pending
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }
                    >
                      {event.status}
                    </Badge>
                  </TableCell>

                  {/* View */}
                  <TableCell className="text-right">
                    {event.status === EventStatus.Approved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View
                      </Button>
                    ) : event.status === EventStatus.Completed ? (
                      <span className="text-xs font-medium text-green-600">
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not approved
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
