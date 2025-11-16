import { useState } from "react";
import { EventCard } from "../../components/EventCard";
import { mockEvents } from "../../lib/mockData";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
    Trophy,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../components/ui/avatar";

export function EventsStats() {
    // Mock data
    const [events] = useState(mockEvents);
    const stats = {
        totalUser: 120,
        active: 48,
        lockec: 2,
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
                                <h1>User Management</h1>
                                <p className="text-muted-foreground">
                                    Manage users
                                </p>
                            </div>

                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Total Users
                                        </p>
                                        <Calendar className="w-5 h-5 text-[#43A047]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {stats.totalUser}
                                    </p>
                                    <p className="text-xs text-[#43A047]">
                                        ↑ 3 from last month
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Active
                                        </p>
                                        <Clock className="w-5 h-5 text-[#2196F3]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {stats.active}
                                    </p>
                                    <p className="text-xs text-[#2196F3]">
                                        ↑ 12 from last month
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Locked
                                        </p>
                                        <Trophy className="w-5 h-5 text-[#FFC107]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {stats.lockec}
                                    </p>
                                    <p className="text-xs text-[#FFC107]">
                                        Top 15% of volunteers
                                    </p>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Organizer</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {events
                                            .filter(
                                                (e) => e.status === "pending"
                                            )
                                            .map((event) => {
                                                // const organizer = users.find(
                                                //     (u) =>
                                                //         u.id === event.managerId
                                                // );
                                                return (
                                                    <TableRow key={event.id}>
                                                        <TableCell className="font-medium">
                                                            {event.title}
                                                        </TableCell>
                                                        <TableCell>
                                                            "Unknown"
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {event.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                event.date
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="gap-1 bg-[#43A047] hover:bg-[#388E3C]"
                                                                    // onClick={() =>
                                                                    //     handleApproveEvent(
                                                                    //         event.id
                                                                    //     )
                                                                    // }
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-1 text-[#F44336] hover:text-[#F44336]"
                                                                    // onClick={() =>
                                                                    //     handleRejectEvent(
                                                                    //         event.id
                                                                    //     )
                                                                    // }
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        {events.filter(
                                            (e) => e.status === "pending"
                                        ).length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center text-muted-foreground py-8"
                                                >
                                                    No pending events to review
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
