import { useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostDialog({ open, onClose }: Props) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { userName, userAvatar } = useAuthState();
  const firstName = userName?.split(" ")[0] || "there";
  const initials =
    userName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  const canPost = content.trim().length > 0;

  const handleSubmit = () => {
    if (!canPost) return;

    const payload = {
      content,
      imageUrl: imageUrl || undefined,
    };

    console.log("CREATE POST:", payload);

    setContent("");
    setImageUrl("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Create post</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{userName}</div>
        </div>

        <textarea
          placeholder={`What's on your mind, ${firstName}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none text-lg border-none outline-none bg-transparent min-h-[120px]"
        />

        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full text-sm bg-muted rounded-md px-3 py-2"
        />

        {imageUrl && (
          <img
            src={imageUrl}
            alt="preview"
            className="rounded-md max-h-60 object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <Button
          disabled={!canPost}
          onClick={handleSubmit}
          className="w-full mt-2"
        >
          Post
        </Button>
      </DialogContent>
    </Dialog>
  );
}
