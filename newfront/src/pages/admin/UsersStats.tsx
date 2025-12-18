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
import { Calendar, Clock, Trophy, Lock } from "lucide-react";
import { Navbar05 } from "../Navbar";
import LeftPanel from "@/components/LeftPanel";
import type { UserProfile } from "@/types/user.type";
import { UserRole, UserStatus } from "@/types/enum";
import { FilterUserBar } from "@/components/FilterUserBar";
import {
  userManagementService,
  type EventManagerStats,
  type VolunteerStats,
} from "@/services/admin/user-management.service";
import { useDebounce } from "@/hooks/useDebounce";

export function UserManagementPage() {
  const [filterUsers, setFilterUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // fixed page size
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

  // stats
  const [volunteerStats, setVolunteerStats] = useState<VolunteerStats | null>(
    null
  );

  const [managerStats, setManagerStats] = useState<EventManagerStats | null>(
    null
  );

  // =========== service ===============
  const debouncedSearch = useDebounce(search, 400);

  // fetch/filter users
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
          {
            page,
            limit,
          }
        );

        setFilterUsers(res.items);
        setTotalItems(res.total);
        setTotalPages(Math.ceil(res.total / limit));
      } catch (error) {
        console.error("Fetch users failed", error);
        setFilterUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, debouncedSearch, selectedRole, selectedStatus]);

  // fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [volunteerRes, managerRes] = await Promise.all([
          userManagementService.getVolunteerStats(),
          userManagementService.getEventManagerStats(),
        ]);

        setVolunteerStats(volunteerRes);
        setManagerStats(managerRes);
      } catch (error) {
        console.error("Fetch stats failed", error);
      }
    };

    fetchStats();
  }, []);

  // ========= filter handles =================
  const handleSearch = (username: string) => {
    setSearchQuery(username);
    setPage(1); // reset pagination when filter changes
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setPage(1); // reset pagination when filter changes
  };

  const handleStatusChange = (status: UserStatus) => {
    setSelectedStatus(status);
    setPage(1); // reset pagination when filter changes
  };

  // =========== lock/unlock ================
  const handleUserLock = async (userId: string, locked: boolean) => {
    try {
      // Call service instead of apiClient directly
      await userManagementService.setUserLock(userId, locked);

      // Optimistically update UI
      setFilterUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: locked ? UserStatus.Locked : UserStatus.Active }
            : u
        )
      );

      //toast.success(`User ${locked ? "locked" : "unlocked"} successfully`);
    } catch (err) {
      console.error("Failed to update user lock status", err);
      //toast.error(`Failed to ${locked ? "lock" : "unlock"} user`);
    }
  };

  // ============= view user =================
  const handleViewUser = (userId: string) => {
    // navigate
  };

  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter((p) => Math.abs(p - page) <= 2);

  return (
    <div className="min-h-screen bg-[#dae0e6] dark:bg-black">

      <div className="flex w-full justify-center">

        <div className="flex flex-1 justify-center min-w-0">
          <div className="space-y-6 w-full max-w-6xl p-6">
            <div>
              <h1 className="text-2xl font-semibold">User Management</h1>
              <p className="text-muted-foreground">Manage users</p>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total Volunteer
                  </p>
                  <Calendar className="w-5 h-5 text-[#43A047]" />
                </div>
                <p className="text-3xl font-semibold">
                  {volunteerStats?.totalVolunteers}
                </p>
              </div>

              {/* <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active</p>
                  <Clock className="w-5 h-5 text-[#2196F3]" />
                </div>
                <p className="text-3xl font-semibold">
                  {volunteerStats?.activeCount}
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Locked</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {volunteerStats?.lockedCount}
                </p>
                <p className="text-xs text-[#FFC107]">Top 15% of volunteers</p>
              </div> */}

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">New Volunteer</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {volunteerStats?.newVolunteers.today}
                </p>
                <p className="text-xs text-[#FFC107]">Today</p>
                <p className="text-3xl font-semibold">
                  {volunteerStats?.newVolunteers.thisWeek}
                </p>
                <p className="text-xs text-[#FFC107]">This Week</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Manager</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {managerStats?.totalEventManagers}
                </p>
                <p className="text-xs text-[#FFC107]">Top 15% of volunteers</p>
              </div>

              {/* <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {managerStats?.activeCount}
                </p>
                <p className="text-xs text-[#FFC107]">.....</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Locked</p>
                  <Trophy className="w-5 h-5 text-[#FFC107]" />
                </div>
                <p className="text-3xl font-semibold">
                  {managerStats?.lockedCount}
                </p>
                <p className="text-xs text-[#FFC107]">.....</p>
              </div> */}
            </div>

            <FilterUserBar
              onSearch={handleSearch}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              selectedRole={selectedRole}
              selectedStatus={selectedStatus}
            />

            {/* table */}
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
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.username}
                              />
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
                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user.id)}
                            >
                              View
                            </Button>

                            {user.status === UserStatus.Active && (
                              <>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUserLock(user.id, true)}
                                >
                                  Lock
                                </Button>
                              </>
                            )}
                            {user.status === UserStatus.Locked && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleUserLock(user.id, false)}
                                >
                                  Unlock
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* pagination */}
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
    </div>
  );
}
