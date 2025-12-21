import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { Event } from "@/types/event.type";
import {
  Bell,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Users,
} from "lucide-react";

import EventEdit from "@/components/event/EventEdit";
import ConfirmDiaLog from "@/components/ConfirmDiaLog";
import { eventService, type EventAuthInfo } from "@/services/event.service";
import { toast } from "sonner";
import { EventStatus, RegistrationStatus } from "@/types/enum";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

interface EventHeaderProps {
  event: Event;
  onCreatePost: () => void;
}

export const EventHeader = ({
  event: initialEvent,
  onCreatePost,
}: EventHeaderProps) => {
  const navigate = useNavigate();
  const [openEdit, setOpenEdit] = useState(false);
  const [authInfo, setAuthInfo] = useState<EventAuthInfo | null>(null);
  const [currentEvent, setCurrentEvent] = useState(initialEvent);
  const [openConfirmComplete, setOpenConfirmComplete] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openJoinRequests, setOpenJoinRequests] = useState(false);

  const { user } = useAuth();
  console.log(user);

  useEffect(() => {
    const fetchAuthData = async () => {
      if (!initialEvent?.id) return;

      try {
        const authData = await eventService.getEventAuthInfo(initialEvent.id);
        setAuthInfo(authData);
      } catch (error) {
        console.error("Failed to fetch event auth info:", error);
      }
    };

    fetchAuthData();
  }, [initialEvent.id]);

  useEffect(() => {
    setCurrentEvent(initialEvent);
  }, [initialEvent]);

  const userStatus = useMemo(() => {
    if (!user?.id || !authInfo) return "GUEST";

    const isOwner = authInfo.ownerId === user.id;
    const isManager = authInfo.managerIds.includes(user.id);

    if (isOwner || isManager) {
      return "MANAGER";
    }

    const userRegistration = authInfo.registers.find(
      (reg) => reg.userId === user.id
    );

    if (userRegistration) {
      switch (userRegistration.status) {
        case RegistrationStatus.Approved:
          return "PARTICIPANT";
        case RegistrationStatus.Pending:
          return "PENDING";
        case RegistrationStatus.Rejected:
          return "REJECTED";
        default:
          return "NONE";
      }
    }

    return "NONE";
  }, [user?.id, authInfo]);

  const handleJoinEvent = async () => {
    if (!user?.id) {
      toast.error("Please login to join this event");
      return;
    }

    try {
      await eventService.registerEvent(currentEvent.id);

      setAuthInfo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          registers: [
            ...(prev.registers || []),
            { userId: user.id, status: RegistrationStatus.Pending },
          ],
        };
      });

      toast.success("Registration sent! Please wait for approval.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join event");
    }
  };

  const handleEditEvent = () => {
    setOpenEdit(true);
  };

  const handleEditSuccess = (updatedEvent: Event) => {
    setCurrentEvent((prev) => ({
      ...prev,
      ...updatedEvent,
    }));

    setOpenEdit(false);
  };

  const handleDeleteEvent = async () => {
    try {
      await eventService.deleteEvent(currentEvent.id);

      toast.success("Event has been canceled and removed.");
      navigate("/communities");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel event");
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await eventService.completeEvent(currentEvent.id);

      setCurrentEvent((prev) => ({
        ...prev,
        status: EventStatus.Completed,
      }));

      toast.success("Congratulations! Event completed.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete event");
    }
  };

  const handleRequestEvent = () => {
    setOpenJoinRequests(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 pb-4 shadow-sm">
        {/* Banner */}
        <div className="h-24 md:h-40 w-full relative overflow-hidden">
          <div className="w-full h-full bg-[#33a852]" />
        </div>

        {/* Info Area */}
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-start gap-4 -mt-6 relative z-10">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white bg-white">
              <AvatarImage
                src={currentEvent.imageUrl}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-zinc-100 text-zinc-500">
                {currentEvent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mt-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentEvent.name}
                </h1>
                <p className="text-zinc-500 text-sm font-medium">
                  r/{currentEvent.name.toLowerCase().replace(/\s+/g, "")}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 items-center">
                {userStatus === "PARTICIPANT" && (
                  <Button
                    className="rounded-full px-6 font-semibold"
                    variant="outline"
                    onClick={onCreatePost}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                )}

                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="w-4 h-4" />
                </Button>

                {userStatus === "MANAGER" ? (
                  <Button
                    className="rounded-full px-6 font-bold bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    variant="secondary"
                    disabled
                  >
                    MANAGER
                  </Button>
                ) : userStatus === "PARTICIPANT" ? (
                  <Button
                    className="rounded-full px-6 font-bold bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    variant="secondary"
                  >
                    Joined
                  </Button>
                ) : userStatus === "PENDING" ? (
                  <Button
                    className="rounded-full px-6 font-bold"
                    variant="secondary"
                    disabled
                  >
                    Pending Approval
                  </Button>
                ) : (
                  <Button
                    className="rounded-full px-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleJoinEvent}
                    disabled={currentEvent.status === EventStatus.Completed}
                  >
                    {currentEvent.status === EventStatus.Completed
                      ? "Event Ended"
                      : "Join Event"}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleEditEvent}
                      disabled={currentEvent.status === EventStatus.Completed}
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit Your Event</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleRequestEvent}
                      disabled={currentEvent.status === EventStatus.Completed}
                    >
                      <Users className="w-4 h-4" />
                      <span>View Join Requests</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => setOpenConfirmComplete(true)}
                      disabled={currentEvent.status === EventStatus.Completed}
                    >
                      <CheckCircle
                        className={`w-4 h-4 ${
                          currentEvent.status === EventStatus.Completed
                            ? "text-zinc-400"
                            : "text-green-600"
                        }`}
                      />
                      <span>
                        {currentEvent.status === EventStatus.Completed
                          ? "Already Completed"
                          : "Mark as completed"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive"
                      onClick={() => setOpenConfirmDelete(true)}
                      disabled={currentEvent.status === EventStatus.Completed}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT EVENT DIALOG ===== */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-3xl">
          <EventEdit event={currentEvent} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>

      {/* ===== CONFIRM COMPLETE EVENT ===== */}
      <ConfirmDiaLog
        open={openConfirmComplete}
        title="Mark event as completed"
        description="Are you sure you want to mark this event as completed? This action cannot be undone."
        confirmText="Yes, mark completed"
        cancelText="Cancel"
        onConfirm={() => {
          handleMarkCompleted();
          setOpenConfirmComplete(false);
        }}
        onCancel={() => setOpenConfirmComplete(false)}
      />

      {/* ===== CONFIRM DELETE EVENT ===== */}
      <ConfirmDiaLog
        open={openConfirmDelete}
        title="Delete event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Yes, delete"
        cancelText="Cancel"
        onConfirm={() => {
          handleDeleteEvent();
          setOpenConfirmDelete(false);
        }}
        onCancel={() => setOpenConfirmDelete(false)}
      />
      {/* ===== JOIN REQUESTS DIALOG ===== */}
      <Dialog open={openJoinRequests} onOpenChange={setOpenJoinRequests}>
        <DialogContent className="max-w-3xl">
          {/* 
      TODO:
      - Truyền eventId
      - Truyền authInfo.registers
      - Component bạn sẽ thêm sau
    */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Join Requests</h2>

            <p className="text-sm text-muted-foreground">
              Manage users who requested to join this event.
            </p>

            {/* PLACEHOLDER */}
            <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
              Join requests component will be added here.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
