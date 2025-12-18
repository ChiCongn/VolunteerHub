import { useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import CreatePostDialog from "./PostCreateDialog";

export default function CreatePost() {
  const [open, setOpen] = useState(false);
  const { userName, userAvatar } = useAuthState();
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <>
      {/* Trigger */}
      <div
        onClick={() => setOpen(true)}
        className="bg-card border rounded-xl p-4 flex items-center gap-3 cursor-pointer shadow-sm hover:shadow-md hover:bg-muted/50 transition"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted" />
        )}
        <div className="flex-1 text-muted-foreground">
          What's on your mind, {firstName}?
        </div>
      </div>

      <CreatePostDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
