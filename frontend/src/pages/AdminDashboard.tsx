import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { mockUsers, mockEvents } from "../lib/mockData";
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
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export function AdminDashboard() {
  const [users] = useState(mockUsers);
  const [events] = useState(mockEvents);

  const handleApproveEvent = (eventId: string) => {
    toast.success("Event approved successfully");
  };

  const handleRejectEvent = (eventId: string) => {
    toast.error("Event rejected");
  };

  const handleLockUser = (userId: string) => {
    toast("User account locked");
  };

  const handleUnlockUser = (userId: string) => {
    toast.success("User account unlocked");
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, events, and platform analytics
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="gap-2 bg-[#43A047] hover:bg-[#388E3C]"
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <Users className="w-5 h-5 text-[#43A047]" />
          </div>
          <p className="text-3xl font-semibold">{users.length}</p>
          <p className="text-xs text-[#43A047]">↑ 12% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active Events</p>
            <Calendar className="w-5 h-5 text-[#2196F3]" />
          </div>
          <p className="text-3xl font-semibold">
            {events.filter((e) => e.status === "upcoming").length}
          </p>
          <p className="text-xs text-[#2196F3]">↑ 8% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Registrations</p>
            <TrendingUp className="w-5 h-5 text-[#FFC107]" />
          </div>
          <p className="text-3xl font-semibold">
            {events.reduce((sum, e) => sum + e.registered, 0)}
          </p>
          <p className="text-xs text-[#FFC107]">↑ 24% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="mb-4">Volunteer Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="volunteers" fill="#43A047" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="mb-4">Events by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="events" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Events</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "destructive" : "default"
                        }
                        className={
                          user.role === "manager"
                            ? "bg-[#2196F3] text-white"
                            : user.role === "admin"
                            ? ""
                            : "bg-[#43A047] text-white"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[#43A047]">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLockUser(user.id)}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events
                  .filter((e) => e.status === "pending")
                  .map((event) => {
                    const organizer = users.find(
                      (u) => u.id === event.managerId
                    );
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell>{organizer?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(event.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="gap-1 bg-[#43A047] hover:bg-[#388E3C]"
                              onClick={() => handleApproveEvent(event.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-[#F44336] hover:text-[#F44336]"
                              onClick={() => handleRejectEvent(event.id)}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {events.filter((e) => e.status === "pending").length === 0 && (
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
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-3">
              {[
                {
                  action: "User registered",
                  user: "Sarah Johnson",
                  time: "2 hours ago",
                },
                {
                  action: "Event approved",
                  user: "Admin",
                  time: "5 hours ago",
                },
                {
                  action: "New event created",
                  user: "Michael Chen",
                  time: "1 day ago",
                },
                {
                  action: "User updated profile",
                  user: "David Kim",
                  time: "2 days ago",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      by {log.user}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
