import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { UserRole, UserStatus } from "@/types/enum";

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onRoleChange?: (role: UserRole) => void;
  onStatusChange?: (status: UserStatus) => void;
  selectedRole?: UserRole;
  selectedStatus?: UserStatus;
}

export function FilterUserBar({
  onSearch,
  onRoleChange,
  onStatusChange,
  selectedRole = UserRole.Volunteer,
  selectedStatus = UserStatus.Active,
}: FilterBarProps) {
  const userRoles = [
    { value: UserRole.Admin, label: "🛡️ Admin" },
    { value: UserRole.EventManager, label: "📅 Event Manager" },
    { value: UserRole.Volunteer, label: "🙋 Volunteer" },
  ];

  const userStatuses = [
    { value: UserStatus.Active, label: "🟢 Active" },
    { value: UserStatus.Pending, label: "🟡 Pending" },
    { value: UserStatus.Locked, label: "🔒 Locked" },
    { value: UserStatus.Deleted, label: "🗑️ Deleted" },
  ];

  return (
    <div className="bg-white border border-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search username..."
            className="pl-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {userStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
