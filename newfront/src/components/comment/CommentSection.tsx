import { useEffect, useState } from "react";
import { commentService, type Comment } from "@/services/comment.service";

import { mockComments } from "./CommentData";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const data = await commentService.getCommentsByPost(postId);
        setComments(data);
      } catch (err) {
        console.error("Lỗi khi tải bình luận:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [postId]);

  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <div className="space-y-4">
      <CommentInput postId={postId} onCommentCreated={handleCommentCreated} />
      {loading ? (
        <div className="text-center text-sm">Đang tải bình luận...</div>
      ) : (
        <CommentList comments={comments} />
      )}
    </div>
  );
}
