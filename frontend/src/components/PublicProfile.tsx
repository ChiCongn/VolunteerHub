import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { UserRole } from "../types/enum";
import type { User, UserProfile } from "../types/user";
import type { AvatarPopupMode } from "./ProfileCard";
import { Badge } from "./ui/badge";

interface Props {
  user: UserProfile;
  viewMode: AvatarPopupMode | null;
  onClose: () => void;
}

export function PublicProfile({ user, viewMode, onClose }: Props) {
  const open = viewMode !== null;
  console.log(viewMode);

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
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogClose className="absolute top-3 right-3" />
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-28 h-28 rounded-full border-4 border-gray-200 shadow"
          />
          <p className="text-xl font-semibold">{user.username}</p>
          <Badge className={getRoleBadgeColor(user.role)}>
            {user.role.replace("_", " ").toUpperCase()}
          </Badge>

          {viewMode === "admin" && (
            <div className="mt-2 w-full text-center text-sm text-muted-foreground">
              <p>ID: {user.id}</p>
              <p>Email: {user.email}</p>
              <p>Status: {user.status}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
