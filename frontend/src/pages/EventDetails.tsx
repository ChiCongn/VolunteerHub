import { useState } from "react";
import { type Event, getUserById, categoryIcons } from "../lib/mockData";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  QrCode,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
  onRegister: (eventId: string) => void;
  isManager?: boolean;
}

export function EventDetails({
  event,
  onBack,
  onRegister,
  isManager = false,
}: EventDetailsProps) {
  const manager = getUserById(event.managerId);
  const registrationPercentage = (event.registered / event.capacity) * 100;
  const spotsLeft = event.capacity - event.registered;
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = () => {
    setIsRegistered(true);
    onRegister(event.id);
    toast.success("Successfully registered for event!");
  };

  const mockRegistrations = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      status: "approved",
    },
    {
      id: "2",
      name: "David Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      status: "approved",
    },
    {
      id: "3",
      name: "Lisa Anderson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        ← Back to Dashboard
      </Button>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="relative h-80">
          <ImageWithFallback
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <Badge className="mb-3 bg-white/20 text-white border-white/40">
              {categoryIcons[event.category]} {event.category}
            </Badge>
            <h1 className="text-white mb-2">{event.title}</h1>
            {manager && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={manager.avatar} alt={manager.name} />
                  <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-white/90">
                  Organized by {manager.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-[#43A047]" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-[#2196F3]" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Users className="w-5 h-5 text-[#FFC107]" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">
                  {event.registered}/{event.capacity} registered
                </p>
                <Progress value={registrationPercentage} className="h-2 mt-2" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-[#43A047]" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">4 hours</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div>
                <h3 className="mb-3">About This Event</h3>
                <p className="text-muted-foreground">{event.description}</p>
                <p className="text-muted-foreground mt-4">
                  Join us for this amazing volunteer opportunity! This event is
                  perfect for anyone looking to make a difference in the
                  community. All skill levels are welcome, and we'll provide all
                  necessary supplies and training.
                </p>
              </div>

              <div>
                <h3 className="mb-3">What to Bring</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Comfortable clothing and closed-toe shoes</li>
                  <li>Water bottle and sunscreen</li>
                  <li>Positive attitude and willingness to help</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="registrations" className="space-y-4 pt-4">
              <div className="space-y-3">
                {mockRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={registration.avatar}
                          alt={registration.name}
                        />
                        <AvatarFallback>
                          {registration.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{registration.name}</p>
                        <Badge
                          variant={
                            registration.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {registration.status}
                        </Badge>
                      </div>
                    </div>
                    {isManager && registration.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#43A047] hover:bg-[#388E3C]"
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-4 pt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>No discussions yet. Be the first to start a conversation!</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4 border-t border-border">
            {isRegistered ? (
              <Button
                className="flex-1 bg-[#43A047] hover:bg-[#388E3C]"
                disabled
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Registered
              </Button>
            ) : (
              <Button
                className="flex-1 bg-[#FFC107] hover:bg-[#FFB300] text-[#212121]"
                onClick={handleRegister}
                disabled={spotsLeft === 0}
              >
                {spotsLeft === 0 ? "Event Full" : "Register for Event"}
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            {isManager && (
              <Button variant="outline" className="gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
