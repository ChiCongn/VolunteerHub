import { useState } from "react";
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
} from "lucide-react";

import EventEdit from "@/components/event/EventEdit";
import ConfirmDiaLog from "@/components/ConfirmDiaLog";
import { eventService } from "@/services/event.service";
import { toast } from "sonner";
import { EventStatus } from "@/types/enum";
import { useNavigate } from "react-router-dom";

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
  const [currentEvent, setCurrentEvent] = useState(initialEvent);
  const [openConfirmComplete, setOpenConfirmComplete] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleEditEvent = () => {
    setOpenEdit(true);
  };

  const handleEditSuccess = (updatedEvent: Event) => {
    setCurrentEvent((prev) => ({
      ...prev,
      ...updatedEvent,
    }));
    console.log(currentEvent);
    console.log(updatedEvent);

    setOpenEdit(false);
  };

  const handleDeleteEvent = async () => {
    try {
      setIsPending(true);
      await eventService.deleteEvent(currentEvent.id);

      toast.success("Event has been canceled and removed.");

      navigate("/communities");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel event");
    } finally {
      setIsPending(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      setIsPending(true);
      await eventService.completeEvent(currentEvent.id);

      setCurrentEvent((prev) => ({
        ...prev,
        status: EventStatus.Completed,
      }));

      toast.success("Congratulations! Event completed.");
      setOpenConfirmComplete(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete event");
    } finally {
      setIsPending(false);
    }
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
                <Button
                  className="rounded-full px-6 font-semibold"
                  variant="outline"
                  onClick={onCreatePost}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>

                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="w-4 h-4" />
                </Button>

                <Button
                  className="rounded-full px-6 font-bold"
                  variant="secondary"
                >
                  Joined
                </Button>

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
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Your Event
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => setOpenConfirmComplete(true)}
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Mark as completed
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive"
                      onClick={handleDeleteEvent}
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
    </>
  );
};
