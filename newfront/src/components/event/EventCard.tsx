import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

type EventCardProps = {
  event: {
    title: string;
    imageUrl: string;
    category: string;
    date: string;
    location: string;
    price?: number;
    description: string;
    status?: string;
  };
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* ===== IMAGE ===== */}
      <div className="relative h-48 w-full">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        {/* Status badge */}
        {event.status && (
          <Badge className="absolute top-3 left-3 bg-white text-black shadow">
            {event.status}
          </Badge>
        )}

        {/* Price badge */}
        <Badge className="absolute top-3 right-3 bg-yellow-400 text-black font-semibold">
          {event.price ? `$${event.price}` : "FREE"}
        </Badge>
      </div>

      {/* ===== CONTENT ===== */}
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          {event.title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{event.category}</Badge>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.date), "MMM dd, yyyy")}
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
      </CardContent>
    </Card>
  );
}
