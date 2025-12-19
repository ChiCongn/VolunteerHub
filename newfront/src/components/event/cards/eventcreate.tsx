"use client";

import { useState } from "react";
import { PlusCircle, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CreateEventPage from "@/components/event/EventCreate";

export default function CreateEventCtaCard() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="relative overflow-hidden border-2 border-dashed">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

      <CardContent className="relative flex flex-col items-center text-center gap-5 py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        <div className="max-w-lg space-y-2">
          <h3 className="text-xl font-semibold">
            Want to contribute more to the community?
          </h3>
          <p className="text-sm text-muted-foreground">
            Organize events, connect volunteers, and create meaningful impact
            together. Your next event could inspire many people.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Event
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[95vw] max-w-none p-0">
  <DialogHeader className="px-6 pt-6">
    <DialogTitle>Create Event</DialogTitle>
  </DialogHeader>

  <div className="max-h-[85vh] overflow-y-auto">
    <CreateEventPage />
  </div>
</DialogContent>

        </Dialog>
      </CardContent>
    </Card>
  );
}
