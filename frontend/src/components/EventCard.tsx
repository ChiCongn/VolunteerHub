import { Calendar, MapPin, Users } from "lucide-react";
import {
  type Event,
  getUserById,
  categoryIcons,
  categoryColors,
} from "../lib/mockData";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
}

export function EventCard({
  event,
  onRegister,
  onViewDetails,
}: EventCardProps) {
  const manager = getUserById(event.managerId);
  const registrationPercentage = (event.registered / event.capacity) * 100;
  const spotsLeft = event.capacity - event.registered;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover hover-lighten cursor-pointer"
          onClick={() => onViewDetails?.(event.id)}
        />
        <div className="absolute top-3 right-3">
          <Badge className={categoryColors[event.category]}>
            {categoryIcons[event.category]} {event.category}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => onViewDetails?.(event.id)}
          >
            {event.title}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {event.registered}/{event.capacity} registered
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Progress value={registrationPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Event full"}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {event.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 bg-[#FFC107] hover:bg-[#FFB300] text-[#212121]"
            onClick={() => onRegister?.(event.id)}
            disabled={spotsLeft === 0}
          >
            {spotsLeft === 0 ? "Full" : "Join Event"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails?.(event.id)}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
