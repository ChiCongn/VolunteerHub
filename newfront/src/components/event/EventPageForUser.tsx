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
import { Dialog, DialogContent } from "../ui/dialog";

type UserEventStatus = "pending" | "approved" | "rejected";

export default function EventPageForUser() {
  const [events, setEvents] = useState<
    (Event & { userStatus: UserEventStatus })[]
  >([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthState();

  const [openLeaveConfirm, setOpenLeaveConfirm] = useState(false);
  const [eventToLeave, setEventToLeave] = useState<string | null>(null);

  // filters
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<UserEventStatus | "all">(
    "all"
  );
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // TODO: Implement getJoinedEvents endpoint
        // For now, fetch all events as a workaround
        const res = await eventService.getEvents();

        // Mock user status for demonstration
        const eventsWithStatus = res.items.map((event) => ({
          ...event,
          userStatus: ["approved", "pending", "rejected"][
            Math.floor(Math.random() * 3)
          ] as UserEventStatus,
        }));

        setEvents(eventsWithStatus);
      } catch (err) {
        console.error("Fetch user events failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user?.id]);

  const filteredEvents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchSearch =
          keyword === "" || event.name.toLowerCase().includes(keyword);

        const matchStatus =
          selectedStatus === "all" || event.userStatus === selectedStatus;

        return matchSearch && matchStatus;
      })
      .slice(0, limit);
  }, [events, searchText, selectedStatus, limit]);

  const handleLeaveEvent = async (eventId: string) => {
    try {
      // TODO: Implement leaveEvent endpoint
      // For now, just remove from local state
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      console.log("Leave event:", eventId);
    } catch (err) {
      console.error("Leave event failed", err);
    }
  };

  const isEventStarted = (startTime: string | Date) => {
    return new Date(startTime) <= new Date();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My Events</h1>
        <p className="text-muted-foreground">
          Events you have registered to participate in
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Status */}
            <Select
              value={selectedStatus}
              onValueChange={(v) =>
                setSelectedStatus(v as UserEventStatus | "all")
              }
            >
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="My Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                {[5, 10, 15, 20, 30, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Event Status</TableHead>
              <TableHead>My Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event, index) => {
                const started = isEventStarted(event.startTime);

                return (
                  <TableRow key={event.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      {new Date(event.startTime).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <img
                        src={getImageUrl(event.imageUrl)}
                        alt={event.name}
                        className="h-16 w-24 object-contain rounded-md border"
                      />
                    </TableCell>

                    <TableCell className="font-medium">{event.name}</TableCell>

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

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          event.userStatus === "approved"
                            ? "text-green-600"
                            : event.userStatus === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {event.userStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={started}
                        onClick={() => {
                          setEventToLeave(event.id);
                          setOpenLeaveConfirm(true);
                        }}
                      >
                        {started ? "Started" : "Leave Event"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={openLeaveConfirm} onOpenChange={setOpenLeaveConfirm}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Leave Event</h2>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to leave this event? You may need to request
              again if you change your mind.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpenLeaveConfirm(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (eventToLeave) {
                    handleLeaveEvent(eventToLeave);
                  }
                  setOpenLeaveConfirm(false);
                  setEventToLeave(null);
                }}
              >
                Leave Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
