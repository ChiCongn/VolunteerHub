import { useEffect, useState } from "react";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postService } from "@/services/post.service";
import type { Reaction } from "@/types/post.type";
import ReactionListDialog from "./ReactionListDialog";

interface Props {
  postId: string; // Cần postId để fetch
  likeCount: number;
  commentCount: number;
  onCommentClick?: () => void;
}

export default function PostActions({
  postId,
  likeCount,
  commentCount,
  onCommentClick,
}: Props) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (likeCount > 0) {
      postService.getReactions(postId).then((data) => {
        setReactions(data.items || []);
      });
    }
  }, [postId, likeCount]);

  const renderSummary = () => {
    if (reactions.length === 0) return null;

    const names = reactions.slice(0, 2).map((r) => r.user?.username);
    const othersCount = likeCount - names.length;

    return (
      <button
        onClick={() => setIsDialogOpen(true)}
        className="hover:underline text-left"
      >
        <span className="font-semibold">{names.join(", ")}</span>
        {othersCount > 0 && (
          <>
            {" "}
            và <span className="font-semibold">{othersCount} người khác</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between text-sm text-muted-foreground mb-2 px-2">
        <span>{renderSummary() || `${likeCount} likes`}</span>
        <span>{commentCount} comments</span>
      </div>

      <div className="flex divide-x">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center rounded-none"
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          Like
        </Button>

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
