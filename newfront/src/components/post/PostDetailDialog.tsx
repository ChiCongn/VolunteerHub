import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PostFeedView } from "@/components/post/PostData";
import PostHeader from "@/components/post/PostHeader";
import PostContent from "@/components/post/PostContent";
import CommentSection from "@/components/comment/CommentSection";
import type { Post } from "@/types";

interface Props {
  post: Post | null;
  open: boolean;
  onClose: () => void;
}

export default function PostDetailDialog({ post, open, onClose }: Props) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl !max-h-[90vh] overflow-y-auto p-0 m-5">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex justify-center">{post.author.username}'s Post</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <PostHeader post={post} />
          <PostContent post={post} />
          <div className="pt-4 sticky border-t">
            <CommentSection />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
