import EventCard from "./EventCard";
import type { Event } from "@/components/event/event";

type EventGridProps = {
  events: Event[];
};

export default function EventGrid({ events }: EventGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
