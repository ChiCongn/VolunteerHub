"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format, startOfDay } from "date-fns";
import {
  CalendarIcon,
  MapPin,
  AlignLeft,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import { toast } from "sonner";
import ConfirmDiaLog from "@/components/ConfirmDiaLog";
import type { Event } from "@/types/event.type";

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  /* ===== FORM STATE ===== */
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const today = startOfDay(new Date());

  /* ===== FETCH EVENT ===== */
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const event: Event = await eventService.getEventById(eventId);

        setName(event.name);
        setLocation(event.location);
        setDescription(event.description || "");
        setStartDate(new Date(event.startTime));
        setEndDate(event.endTime ? new Date(event.endTime) : undefined);
      } catch (err) {
        toast.error("Failed to load event");
        navigate("/communities");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  /* ===== SUBMIT ===== */
  const handleUpdateEvent = async () => {
    if (!name || !location || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (endDate && endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setIsSubmitting(true);

    //   await eventService.updateEvent(eventId!, {
    //     name,
    //     location,
    //     description,
    //     startTime: startDate.toISOString(),
    //     endTime: endDate?.toISOString(),
    //   });

      toast.success("Event updated successfully!");
      navigate("/communities");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Event Time</span>
            </div>

            <div className="relative pl-6 space-y-4">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-muted-foreground/30" />

              {/* Start */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-1.05rem] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < today}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-1.05rem] top-3 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : "End date (optional)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < today}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlignLeft className="h-4 w-4" />
              <span>Description</span>
            </div>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => setOpenConfirm(true)}
            disabled={isSubmitting}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>

      {/* CONFIRM */}
      <ConfirmDiaLog
        open={openConfirm}
        title="Confirm update"
        description="Are you sure you want to update this event?"
        confirmText="Yes, update"
        cancelText="Cancel"
        onConfirm={() => {
          setOpenConfirm(false);
          handleUpdateEvent();
        }}
        onCancel={() => setOpenConfirm(false)}
      />
    </div>
  );
}
