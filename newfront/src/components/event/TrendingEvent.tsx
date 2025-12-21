import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, TrendingUp } from "lucide-react";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types/event.type";
import { useNavigate } from "react-router-dom";

export default function TrendingEvents() {
  const [trending, setTrending] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await eventService.getEvents({ page: 1, limit: 5 });
        setTrending(data.items);
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border border-zinc-200 overflow-hidden bg-white">
        <CardHeader className="bg-green-600 py-3 px-4 flex flex-row items-center gap-2 rounded-t-lg">
          <TrendingUp className="w-4 h-4 text-white" />
          <span className="font-bold text-sm text-white">Trending Events</span>
        </CardHeader>

        <div className="p-0 bg-white">
          {trending.map((event, index) => (
            <div
              key={event.id}
              className="p-4 hover:bg-zinc-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 rounded-md">
                  <AvatarImage src={event.imageUrl} />
                  <AvatarFallback>EV</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm line-clamp-1">
                    {event.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {event.registerCount || 0} participants
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="p-3">
            <Button
              variant="outline"
              className="w-full rounded-full font-bold text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={() => navigate("/communities")}
            >
              View All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
