import { mockComments } from "./CommentData";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput"

export default function CommentSection() {
  return (
    <div className="space-y-4">
      <CommentList comments={mockComments} />
      <CommentInput />
    </div>
  );
}
