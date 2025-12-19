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
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{likeCount} likes</span>
        <span>{commentCount} comments</span>
      </div>

      <div className="flex justify-around">
        <Button variant="ghost" size="sm">
          <ThumbsUp className="w-4 h-4 mr-1" />
          Like
        </Button>

        <Button variant="ghost" size="sm" onClick={onCommentClick}>
          <MessageCircle className="w-4 h-4 mr-1" />
          Comment
        </Button>
      </div>
    </div>
  );
}
