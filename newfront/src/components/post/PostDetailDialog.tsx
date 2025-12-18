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

interface Props {
  post: PostFeedView | null;
  open: boolean;
  onClose: () => void;
}

export default function PostDetailDialog({ post, open, onClose }: Props) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex justify-center">{post.author.name}'s Post</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* POST */}
          <PostHeader post={post} />
          <PostContent post={post} />

          {/* COMMENT SECTION */}
          <div className="pt-4 border-t">
            <CommentSection />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
