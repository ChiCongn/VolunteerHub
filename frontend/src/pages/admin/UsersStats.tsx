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
import { Trophy, Calendar, Clock, Lock, Unlock } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../components/ui/avatar";
import { mockUsers } from "../../lib/mockData";

export function UserStats() {
    // Mock data
    const [users] = useState(mockUsers);
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
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage
                                                                src={
                                                                    user.avatar
                                                                }
                                                                alt={user.name}
                                                            />
                                                            <AvatarFallback>
                                                                {user.name.charAt(
                                                                    0
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.role ===
                                                            "admin"
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                        className={
                                                            user.role ===
                                                            "manager"
                                                                ? "bg-[#2196F3] text-white"
                                                                : user.role ===
                                                                  "admin"
                                                                ? ""
                                                                : "bg-[#43A047] text-white"
                                                        }
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[#43A047]"
                                                    >
                                                        Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            // onClick={() =>
                                                            //     handleLockUser(
                                                            //         user.id
                                                            //     )
                                                            // }
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
