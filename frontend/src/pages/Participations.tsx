import { useState } from "react";
import { EventCard } from "../components/EventCard";
import { mockEvents } from "../lib/mockData";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Trophy, Calendar, Clock } from "lucide-react";

interface ParticipationsProps {
    onEventClick: (eventId: string) => void;
}

export function Participations() {
    // Mock data - in real app, this would be filtered by current user's registrations
    const upcomingEvents = mockEvents
        .filter((e) => e.status === "upcoming")
        .slice(0, 2);
    const pastEvents = mockEvents
        .filter((e) => e.status === "completed" || e.status === "ongoing")
        .slice(0, 3);

    const stats = {
        eventsAttended: 12,
        hoursVolunteered: 48,
        impactScore: 850,
        badges: [
            {
                name: "Environmental Hero",
                icon: "🌿",
                description: "Participated in 5 environment events",
            },
            {
                name: "Community Champion",
                icon: "🤝",
                description: "Helped 100+ people",
            },
            { name: "Early Bird", icon: "🐦", description: "Always on time" },
        ],
    };

    return (
        <div>
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 min-w-0">
                    <div className="container max-w-[1440px] mx-auto px-4 py-6 mb-16 md:mb-0">
                        <div className="space-y-6">
                            <div>
                                <h1>My Participations</h1>
                                <p className="text-muted-foreground">
                                    Track your volunteer journey and
                                    achievements
                                </p>
                            </div>

                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Events Attended
                                        </p>
                                        <Calendar className="w-5 h-5 text-[#43A047]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {stats.eventsAttended}
                                    </p>
                                    <p className="text-xs text-[#43A047]">
                                        ↑ 3 from last month
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Hours Volunteered
                                        </p>
                                        <Clock className="w-5 h-5 text-[#2196F3]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {stats.hoursVolunteered}
                                    </p>
                                    <p className="text-xs text-[#2196F3]">
                                        ↑ 12 from last month
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Impact Score
                                        </p>
                                        <Trophy className="w-5 h-5 text-[#FFC107]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {stats.impactScore}
                                    </p>
                                    <p className="text-xs text-[#FFC107]">
                                        Top 15% of volunteers
                                    </p>
                                </div>
                            </div>

                            {/* Badges Section */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h3 className="mb-4">Your Badges</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {stats.badges.map((badge) => (
                                        <div
                                            key={badge.name}
                                            className="flex items-start gap-3 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                        >
                                            <div className="text-3xl">
                                                {badge.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {badge.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {badge.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Events Tabs */}
                            <Tabs defaultValue="upcoming" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="upcoming">
                                        Upcoming Events ({upcomingEvents.length}
                                        )
                                    </TabsTrigger>
                                    <TabsTrigger value="past">
                                        Past Events ({pastEvents.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="upcoming"
                                    className="space-y-6 mt-6"
                                >
                                    {upcomingEvents.length > 0 ? (
                                        upcomingEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="relative"
                                            >
                                                <Badge className="absolute -top-2 right-4 z-10 bg-[#43A047]">
                                                    Registered
                                                </Badge>
                                                <EventCard
                                                    event={event}
                                                    onRegister={() => {}}
                                                    //onViewDetails={onEventClick}
                                                    //showRegisterButton={false}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-card rounded-lg border border-border">
                                            <p className="text-muted-foreground mb-2">
                                                No upcoming events
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Browse the event list to find
                                                volunteer opportunities
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent
                                    value="past"
                                    className="space-y-6 mt-6"
                                >
                                    {pastEvents.length > 0 ? (
                                        pastEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="relative"
                                            >
                                                <Badge className="absolute -top-2 right-4 z-10 bg-[#2196F3]">
                                                    Completed
                                                </Badge>
                                                <EventCard
                                                    event={event}
                                                    onRegister={() => {}}
                                                    //onViewDetails={onEventClick}
                                                    //showRegisterButton={false}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-card rounded-lg border border-border">
                                            <p className="text-muted-foreground mb-2">
                                                No past events
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Your completed volunteer events
                                                will appear here
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
