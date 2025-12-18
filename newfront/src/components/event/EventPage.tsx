import EventGrid from "@/components/event/EventGird";
import { events } from "@/components/event/event";

export default function EventPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-muted-foreground">
          Discover upcoming volunteer events and community activities
        </p>
      </div>

      <EventGrid events={events} />
    </div>
  );
}
