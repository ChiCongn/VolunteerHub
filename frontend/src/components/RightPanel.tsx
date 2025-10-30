import { TrendingUp, Calendar } from "lucide-react";
import { type Event, categoryIcons } from "../lib/mockData";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface RightPanelProps {
  trendingEvents: Event[];
  recommendedEvents: Event[];
  onEventClick: (eventId: string) => void;
}

export function RightPanel({
  trendingEvents,
  recommendedEvents,
  onEventClick,
}: RightPanelProps) {
  return (
    <aside className="hidden lg:block w-[360px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-6 border-l border-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#43A047]" />
          <h2>Trending Events</h2>
        </div>

        <div className="space-y-2">
          {trendingEvents.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-lg border border-border bg-card hover:bg-muted cursor-pointer transition-colors"
              onClick={() => onEventClick(event.id)}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">
                  {categoryIcons[event.category]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2 text-sm">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {event.registered}/{event.capacity} joined
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2>Recommended for You</h2>

        <div className="space-y-2">
          {recommendedEvents.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-lg border border-border bg-card hover:bg-muted cursor-pointer transition-colors"
              onClick={() => onEventClick(event.id)}
            >
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {categoryIcons[event.category]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2 text-sm">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.location}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#212121]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event.id);
                  }}
                >
                  Join
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gradient-to-br from-[#43A047]/10 to-[#2196F3]/10 border border-border">
        <h3 className="text-sm mb-2">💡 Quick Tip</h3>
        <p className="text-xs text-muted-foreground">
          Complete your profile to get better event recommendations based on
          your interests!
        </p>
      </div>
    </aside>
  );
}
