import type { User } from "../lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Mail } from "lucide-react";

interface ProfileCardProps {
  user: User;
  onEdit?: () => void;
  eventsAttended?: number;
  hoursVolunteered?: number;
}

export function ProfileCard({
  user,
  onEdit,
  eventsAttended = 0,
  hoursVolunteered = 0,
}: ProfileCardProps) {
  const getRoleBadgeColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-[#F44336] text-white";
      case "manager":
        return "bg-[#2196F3] text-white";
      default:
        return "bg-[#43A047] text-white";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-[#43A047] to-[#2196F3]" />

      <div className="px-6 pb-6">
        <div className="flex justify-between items-start -mt-12 mb-4">
          <Avatar className="w-24 h-24 border-4 border-card">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {onEdit && (
            <Button variant="outline" className="mt-16" onClick={onEdit}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2>{user.name}</h2>
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            {user.bio && <p className="text-muted-foreground">{user.bio}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#43A047]">
                {eventsAttended}
              </p>
              <p className="text-xs text-muted-foreground">Events Attended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#2196F3]">
                {hoursVolunteered}
              </p>
              <p className="text-xs text-muted-foreground">Hours Volunteered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
