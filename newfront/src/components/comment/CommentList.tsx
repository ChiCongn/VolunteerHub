import type { CommentView } from "@/types/comment.type";
import CommentItem from "./CommentItem";
import { commentService, type Comment } from "@/services/comment.service";

interface Props {
  comments: Comment[];
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  const reversedComments = [...comments].reverse();
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="text-center text-zinc-500 py-10 text-sm">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        reversedComments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} />
        ))
      )}
    </div>
  );
}
