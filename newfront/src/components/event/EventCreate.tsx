import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay } from "date-fns";
import {
  CalendarIcon,
  ImageIcon,
  MapPin,
  AlignLeft,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventCategory } from "@/types/enum";

const CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: "📚 Education", value: "education" as EventCategory },
  { label: "💬 Social", value: "social" as EventCategory },
  { label: "🤝 Community Service", value: "community_service" as EventCategory },
  { label: "❤️ Health & Wellness", value: "health_wellness" as EventCategory },
  { label: "💻 Technology & STEM", value: "technology_stem" as EventCategory },
  { label: "✨ Other", value: "other" as EventCategory },
];

export default function CreateEventPage() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [categories, setCategories] = useState<EventCategory[]>([]);

  // 👉 hôm nay (00:00) để so sánh
  const today = startOfDay(new Date());

  const toggleCategory = (value: EventCategory) => {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Image */}
      <Card className="md:col-span-1">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-full aspect-square border rounded-xl flex items-center justify-center bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm">
            Upload Image
          </Button>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event name */}
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input placeholder="Enter event name" />
          </div>

          {/* Event Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Event Time</span>
            </div>

            <div className="relative pl-6 space-y-4">
              {/* vertical line */}
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
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < today} // 🚫 không cho quá khứ
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
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
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
            <Input placeholder="Offline location or virtual link" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlignLeft className="h-4 w-4" />
              <span>Description</span>
            </div>
            <Textarea placeholder="Describe your event" rows={4} />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Capacity</span>
            </div>
            <Input type="number" min={1} placeholder="Number of participants" />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={categories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full">Create Event</Button>
        </CardContent>
      </Card>
    </div>
  );
}
