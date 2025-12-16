import { useState } from "react";
import { UserRole } from "../types/enum";
import type { User, UserProfile } from "../types/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Mail, MapPin, Calendar } from "lucide-react";
import { PublicProfile } from "./PublicProfile";

export type AvatarPopupMode = "edit" | "view" | "admin" | null;

interface ProfileCardProps {
  user: UserProfile;
  isEdit: boolean;
  eventsAttended?: number;
  hoursVolunteered?: number;
}

export function ProfileCard({
  user,
  isEdit = false,
  eventsAttended = 0,
  hoursVolunteered = 0,
}: ProfileCardProps) {
  const [avatarMode, setAvatarMode] = useState<AvatarPopupMode>(null);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
      case UserRole.RootAdmin:
        return "bg-[#F44336] text-white";
      case UserRole.EventManager:
        return "bg-[#2196F3] text-white";
      default:
        return "bg-[#43A047] text-white";
    }
  };

  const handleAvatarClick = () => {
    if (isEdit) {
      setAvatarMode("edit");
    } else {
      // if the clicked user is an admin, show admin view
      setAvatarMode(
        user.role === UserRole.Admin || user.role === UserRole.RootAdmin
          ? "admin"
          : "view"
      );
    }
  };
  const closePopup = () => setAvatarMode(null);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-[#43A047] to-[#2196F3]" />

      <div className="px-6 pb-6">
        <div className="flex justify-between items-start -mt-12 mb-4">
          <Avatar
            className="w-24 h-24 border-4 border-card cursor-pointer"
            onClick={handleAvatarClick}
          >
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* {avatarMode === "edit" && (
            //<EditAvatarModal user={user} onClose={closePopup} />
          )} */}

          {avatarMode && (
            <PublicProfile
              user={user}
              viewMode={avatarMode}
              onClose={closePopup}
            />
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2>{user.username}</h2>
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
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
