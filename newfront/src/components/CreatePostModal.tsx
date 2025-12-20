import React, { useState } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  userAvatar?: string;
  userName: string;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onSubmit,
  userAvatar,
  userName,
}: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, imageUrl);
      setContent("");
      setImageUrl("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Create a post</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-xs">
                {userName && userName.length > 0
                  ? userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind?"
                className="w-full min-h-[100px] resize-none bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Image Input (Simple URL for now) */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Image URL (optional)..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative rounded-md overflow-hidden bg-zinc-100 max-h-60">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 rounded-b-lg">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-500">
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="rounded-full px-6"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
