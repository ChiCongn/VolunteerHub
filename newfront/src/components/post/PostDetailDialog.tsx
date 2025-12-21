import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Post } from "@/types/post.type";
import PostHeader from "@/components/post/PostHeader";
import PostContent from "@/components/post/PostContent";
import CommentSection from "@/components/comment/CommentSection";
import PostActions from "./PostActions";

interface Props {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onCommentClick?: (post: Post) => void;
  onLikeClick?: (post: Post) => void;
}

export default function PostDetailDialog({
  post,
  open,
  onClose,
  onCommentClick,
  onLikeClick,
}: Props) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl !max-h-[90vh] overflow-y-auto p-0 m-5">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex justify-center">
            {post.author.username || "User"}'s Post
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <PostHeader post={post} />
          <PostContent post={post} />
          <PostActions
            postId={post.id}
            likeCount={post.reactionCount}
            commentCount={post.commentCount}
            onCommentClick={() => onCommentClick?.(post)}
          />
          <div className="pt-4 sticky border-t">
            <CommentSection postId={post.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
