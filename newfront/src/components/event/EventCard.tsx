import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/types/event.type";

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl hover:shadow-md transition">
      <div className="relative h-48">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="h-full w-full object-cover"
        />

        <Badge className="absolute top-3 left-3">
          {event.status}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-semibold line-clamp-2">
          {event.name}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {event.categories.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat.replace("_", " ")}
            </Badge>
          ))}

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(event.startTime, "MMM dd, yyyy")}
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
      </CardContent>
    </Card>
  );
}
