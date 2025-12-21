import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EventStatus, RegistrationStatus } from "@/types/enum";
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
import {
  registrationService,
  type UserJoinedEvent,
} from "@/services/registration.service";
import { toast } from "sonner";

export default function EventPageForUser() {
  const [joinedEvents, setJoinedEvents] = useState<UserJoinedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthState();

  // filters
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    RegistrationStatus | "all"
  >("all");
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const data = await registrationService.getMyJoinedEvents();
        setJoinedEvents(data);
      } catch (err) {
        console.error("Fetch user events failed", err);
        toast.error("Failed to load your events");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user?.id]);

  const filteredEvents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return joinedEvents
      .filter((event) => {
        const matchSearch =
          keyword === "" || event.eventName.toLowerCase().includes(keyword);

        const matchStatus =
          selectedStatus === "all" ||
          event.registrationStatus === selectedStatus;

        return matchSearch && matchStatus;
      })
      .slice(0, limit);
  }, [joinedEvents, searchText, selectedStatus, limit]);

  const handleLeaveEvent = async (registrationId: string) => {
    try {
      await registrationService.withdrawRegistration(registrationId);
      setJoinedEvents((prev) =>
        prev.filter((e) => e.registrationId !== registrationId)
      );
      toast.success("Left event successfully");
    } catch (err) {
      toast.error("Could not leave event at this time");
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
                setSelectedStatus(v as RegistrationStatus | "all")
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
              filteredEvents.map((joinedEvent, index) => {
                const started = isEventStarted(joinedEvent.startTime);

                return (
                  <TableRow key={joinedEvent.eventId}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      {new Date(joinedEvent.startTime).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <img
                        src={getImageUrl(joinedEvent.imageUrl)}
                        alt={joinedEvent.eventName}
                        className="h-16 w-24 object-contain rounded-md border"
                      />
                    </TableCell>

                    <TableCell className="font-medium">{joinedEvent.eventName}</TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          joinedEvent.eventStatus === EventStatus.Approved
                            ? "text-green-600"
                            : joinedEvent.eventStatus === EventStatus.Pending
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }
                      >
                        {joinedEvent.eventStatus}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          joinedEvent.registrationStatus === RegistrationStatus.Approved
                            ? "text-green-600"
                            : joinedEvent.registrationStatus === RegistrationStatus.Pending
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {joinedEvent.registrationStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/events/${joinedEvent.eventId}`)}
                      >
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={started}
                        onClick={() => handleLeaveEvent(joinedEvent.registrationId)}
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
    </div>
  );
}
