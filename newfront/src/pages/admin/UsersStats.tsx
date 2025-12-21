"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Trophy } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { UserProfile } from "@/types/user.type";
import { UserRole, UserStatus } from "@/types/enum";
import { FilterUserBar } from "@/components/FilterUserBar";
import {
  userManagementService,
  type EventManagerStats,
  type VolunteerStats,
} from "@/services/admin/user-management.service";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export function UserManagementPage() {
  const [filterUsers, setFilterUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // filter
  const [search, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.Volunteer
  );
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(
    UserStatus.Active
  );

  // role editing
  const [editingRoles, setEditingRoles] = useState<Record<string, UserRole>>(
    {}
  );

  // stats
  const [volunteerStats, setVolunteerStats] = useState<VolunteerStats | null>(
    null
  );
  const [managerStats, setManagerStats] = useState<EventManagerStats | null>(
    null
  );

  const debouncedSearch = useDebounce(search, 400);

  /* ================= FETCH USERS ================= */

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await userManagementService.listUser(
          {
            search: debouncedSearch || undefined,
            role: selectedRole,
            status: selectedStatus,
          },
          { page, limit }
        );

        setFilterUsers(res.items);
        setTotalItems(res.total);
        setTotalPages(Math.ceil(res.total / limit));
      } catch (err) {
        console.error("Fetch users failed", err);
        setFilterUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, debouncedSearch, selectedRole, selectedStatus]);

  /* ================= FETCH STATS ================= */

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [volunteerRes, managerRes] = await Promise.all([
          userManagementService.getVolunteerStats(),
          userManagementService.getEventManagerStats(),
        ]);

        setVolunteerStats(volunteerRes);
        setManagerStats(managerRes);
      } catch (err) {
        console.error("Fetch stats failed", err);
      }
    };

    fetchStats();
  }, []);

  /* ================= HANDLERS ================= */

  const handleSearch = (username: string) => {
    setSearchQuery(username);
    setPage(1);
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setPage(1);
  };

  const handleStatusChange = (status: UserStatus) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleViewUser = (userId: string) => {
    console.log("View user:", userId);
  };

  const handleUserLock = async (userId: string, locked: boolean) => {
    try {
      await userManagementService.setUserLock(userId, locked);

      setFilterUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: locked ? UserStatus.Locked : UserStatus.Active,
              }
            : u
        )
      );
      if (locked) {
        toast.success("User has been locked");
      } else {
        toast.success("User has been unlocked");
      }
    } catch (err) {
      toast.error("Lock/unlock failed");
      console.error("Lock/unlock failed", err);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    const newRole = editingRoles[userId];
    if (!newRole) return;

    try {
      await userManagementService.updateUserRole(userId, newRole);

      setFilterUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      setEditingRoles((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      toast.success("Updated role successfully");
    } catch (err) {
      toast.error("Failed to update user role");
      console.error("Update role failed", err);
    }
  };

  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter((p) => Math.abs(p - page) <= 2);

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-card">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">User Management</h1>
            <p className="text-muted-foreground">Manage users</p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total Volunteer</p>
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-semibold">
                {volunteerStats?.totalVolunteers}
              </p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">New Volunteer</p>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-semibold">
                {volunteerStats?.newVolunteers.today}
              </p>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-2xl font-semibold mt-2">
                {volunteerStats?.newVolunteers.thisWeek}
              </p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total Manager</p>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-semibold">
                {managerStats?.totalEventManagers}
              </p>
            </div>
          </div>

          {/* FILTER */}
          <FilterUserBar
            onSearch={handleSearch}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
            selectedRole={selectedRole}
            selectedStatus={selectedStatus}
          />

          {/* TABLE */}
          <div className="bg-white border rounded-lg overflow-hidden">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filterUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filterUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>
                              {user.username.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>

                      <TableCell>{user.email}</TableCell>

                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === UserStatus.Active
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(user.id)}
                          >
                            View
                          </Button>

                          <Select
                            value={editingRoles[user.id] ?? user.role}
                            onValueChange={(value) =>
                              setEditingRoles((prev) => ({
                                ...prev,
                                [user.id]: value as UserRole,
                              }))
                            }
                            disabled={user.status === UserStatus.Locked}
                          >
                            <SelectTrigger className="w-[150px] h-8">
                              <SelectValue placeholder="Change Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UserRole.Volunteer}>
                                Volunteer
                              </SelectItem>
                              <SelectItem value={UserRole.EventManager}>
                                Event Manager
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {editingRoles[user.id] &&
                            editingRoles[user.id] !== user.role && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateRole(user.id)}
                              >
                                Update
                              </Button>
                            )}

                          {user.status === UserStatus.Active && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserLock(user.id, true)}
                            >
                              Lock
                            </Button>
                          )}

                          {user.status === UserStatus.Locked && (
                            <Button
                              size="sm"
                              onClick={() => handleUserLock(user.id, false)}
                            >
                              Unlock
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          <Pagination className="py-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  isActive={page !== 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>

              {visiblePages.map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={page === p}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  isActive={page !== totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
