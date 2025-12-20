import { useEffect, useState, useRef } from "react";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postService } from "@/services/post.service";
import type { Reaction } from "@/types/post.type";
import ReactionListDialog from "./ReactionListDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { EMOJIS } from "@/lib/constants";

interface Props {
  postId: string;
  likeCount: number;
  commentCount: number;
  myReaction?: string;
  onCommentClick?: () => void;
}

// Key để lưu trữ trong localStorage
const STORAGE_KEY = "volunteer_hub_local_reactions";

export default function PostActions({
  postId,
  likeCount: initialLikeCount,
  commentCount,
  myReaction: initialReaction,
  onCommentClick,
}: Props) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [currentReaction, setCurrentReaction] = useState<string | undefined>(
    () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const reactionMap = JSON.parse(saved);
        return reactionMap[postId] || initialReaction;
      }
      return initialReaction;
    }
  );

  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Lưu vào localStorage mỗi khi currentReaction thay đổi
  const saveToLocal = (postId: string, emoji: string | undefined) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const reactionMap = saved ? JSON.parse(saved) : {};

    if (emoji) {
      reactionMap[postId] = emoji;
    } else {
      delete reactionMap[postId];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reactionMap));
  };

  const handleReaction = async (emoji: string) => {
    setIsPickerOpen(false);

    const isRemoving = currentReaction === emoji;
    const nextEmoji = isRemoving ? undefined : emoji;

    // Cập nhật UI ngay lập tức
    setCurrentReaction(nextEmoji);
    setLikeCount((prev) =>
      isRemoving ? prev - 1 : currentReaction ? prev : prev + 1
    );

    // LƯU TRẠNG THÁI VÀO LOCAL STORAGE
    saveToLocal(postId, nextEmoji);

    try {
      // Vẫn gọi API để sync với DB (nếu bạn muốn bỏ qua DB hoàn toàn thì comment dòng này)
      await postService.toggleReaction(postId, emoji);
      fetchReactions();
    } catch (error) {
      console.error("Lỗi sync DB, nhưng local state vẫn giữ nguyên");
    }
  };

  // ... (giữ nguyên fetchReactions và useEffect fetch data)
  const fetchReactions = async () => {
    const data = await postService.getReactions(postId);
    setReactions(data.items || []);
  };

  useEffect(() => {
    if (likeCount > 0) fetchReactions();
  }, [postId]);

  const renderLikeButton = () => {
    const activeEmoji = EMOJIS.find((e) => e.id === currentReaction);
    return (
      <div className="flex items-center gap-1">
        {activeEmoji ? (
          <span className="text-lg animate-in zoom-in duration-200">
            {activeEmoji.icon}
          </span>
        ) : (
          <ThumbsUp className="w-4 h-4 mr-1" />
        )}
        <span className={cn(activeEmoji?.color || "text-muted-foreground")}>
          {activeEmoji?.label || "Like"}
        </span>
      </div>
    );
  };

  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between text-sm text-muted-foreground mb-2 px-2">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="hover:underline"
        >
          {likeCount} người đã tương tác
        </button>
        <span>{commentCount} comments</span>
      </div>

      <div className="flex divide-x">
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-center rounded-none"
              onClick={() => handleReaction(currentReaction || "like")}
              onMouseEnter={() => {
                hoverTimeout.current = setTimeout(
                  () => setIsPickerOpen(true),
                  500
                );
              }}
              onMouseLeave={() => {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              }}
            >
              {renderLikeButton()}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-fit p-1 rounded-full shadow-xl animate-in slide-in-from-bottom-2"
          >
            <div className="flex gap-2 px-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji.id}
                  onClick={() => handleReaction(emoji.id)}
                  className="text-2xl hover:scale-150 transition-transform duration-200 p-1"
                >
                  {emoji.icon}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center rounded-none"
          onClick={onCommentClick}
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Comment
        </Button>
      </div>

      <ReactionListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        reactions={reactions}
      />
    </div>
  );
}
