import { useState } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { mockUsers, mockEvents } from "../../lib/mockData";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Users,
    Calendar,
    TrendingUp,
    Download,
    Upload,
    Lock,
    Unlock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

export function Overview() {
    const [users] = useState(mockUsers);
    const [events] = useState(mockEvents);

    const handleExport = () => {
        toast.success("Exporting data...");
    };

    const attendanceData = [
        { month: "Jun", volunteers: 145 },
        { month: "Jul", volunteers: 198 },
        { month: "Aug", volunteers: 223 },
        { month: "Sep", volunteers: 267 },
        { month: "Oct", volunteers: 312 },
    ];

    const categoryData = [
        { category: "Environment", events: 12 },
        { category: "Education", events: 8 },
        { category: "Health", events: 6 },
        { category: "Community", events: 10 },
        { category: "Animals", events: 5 },
    ];

    return (
        <div>
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 min-w-0">
                    <div className="container max-w-[1440px] mx-auto px-4 py-6 mb-16 md:mb-0">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1>Overview Stats VolunteerHub</h1>
                                    <p className="text-muted-foreground">
                                        Manage users, events, and platform
                                        analytics
                                    </p>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    className="gap-2 bg-[#43A047] hover:bg-[#388E3C]"
                                >
                                    <Upload className="w-4 h-4" />
                                    Export Data
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Total Users
                                        </p>
                                        <Users className="w-5 h-5 text-[#43A047]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {users.length}
                                    </p>
                                    <p className="text-xs text-[#43A047]">
                                        ↑ 12% from last month
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Active Events
                                        </p>
                                        <Calendar className="w-5 h-5 text-[#2196F3]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {
                                            events.filter(
                                                (e) => e.status === "upcoming"
                                            ).length
                                        }
                                    </p>
                                    <p className="text-xs text-[#2196F3]">
                                        ↑ 8% from last month
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Total Registrations
                                        </p>
                                        <TrendingUp className="w-5 h-5 text-[#FFC107]" />
                                    </div>
                                    <p className="text-3xl font-semibold">
                                        {events.reduce(
                                            (sum, e) => sum + e.registered,
                                            0
                                        )}
                                    </p>
                                    <p className="text-xs text-[#FFC107]">
                                        ↑ 24% from last month
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-card border border-border rounded-lg p-6">
                                    <h3 className="mb-4">
                                        Volunteer Attendance Trend
                                    </h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}
                                    >
                                        <BarChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="volunteers"
                                                fill="#43A047"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-6">
                                    <h3 className="mb-4">Events by Category</h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}
                                    >
                                        <BarChart
                                            data={categoryData}
                                            layout="vertical"
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis
                                                dataKey="category"
                                                type="category"
                                                width={100}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey="events"
                                                fill="#2196F3"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
