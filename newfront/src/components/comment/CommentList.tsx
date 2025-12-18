import type { CommentView } from "@/types/comment.type";
import CommentItem from "./CommentItem";

interface Props {
  comments: CommentView[];
}

export default function CommentList({ comments }: Props) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
