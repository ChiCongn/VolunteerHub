import { MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types";

interface Props {
  likeCount: number;
  commentCount: number;
  onCommentClick?: () => void;
}

export default function PostActions({
  likeCount,
  commentCount,
  onCommentClick,
}: Props) {
  return (
    <div className="pt-2 border-t">
      <div className="flex justify-between text-sm text-muted-foreground mb-2 px-2">
        <span>{likeCount} likes</span>
        <span>{commentCount} comments</span>
      </div>

      {/* NÚT LIKE / COMMENT – MỖI NÚT 1/2 */}
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
    </div>
  );
}
